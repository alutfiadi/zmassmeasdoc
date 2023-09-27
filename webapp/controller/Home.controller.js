sap.ui.define(
  [
    "zmassmeasdoc/controller/BaseController",
    "sap/ui/model/type/String",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/SearchField",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/Text"
  ],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function(
    Controller,
    TypeString,
    ColumnListItem,
    Label,
    SearchField,
    Token,
    Filter,
    FilterOperator,
    ODataModel,
    UIColumn,
    MColumn,
    Text
  ) {
    "use strict";

    return Controller.extend("zmassmeasdoc.controller.Home", {
      onInit: function() {
        // Value Help Dialog standard use case with filter bar without filter suggestions
        var oInputTechnicalObject = this.byId("technicalObject");
        this._oInputTechnicalObject = oInputTechnicalObject;
        this.oTehcObjVHModel = this.getOwnerComponent().getModel("techObjVH");
      },

      onChangeObjectType: function(oEvent) {
        const objectType = this.byId("refObjectType").getSelectedKey();
        let visibilityPM = true;
        if (objectType == "PM") {
          visibilityPM = true;
        } else {
          visibilityPM = false;
        }

        this.byId("feTechnicalObject").setVisible(visibilityPM);
        this.byId("feRentalUnit").setVisible(!visibilityPM);
      },

      //Handle on Submit
      onSubmit: function() {
        var technicalObject = this.byId("technicalObject").getTokens();
        if (technicalObject.length > 0) {
          const equipmentid = technicalObject[0].getKey();
          const equipmentname = technicalObject[0].getText();
          this.getRouter().navTo("Create", {
            equipment: equipmentid,
            equipmentname: equipmentname
          });
        } else {
          this.byId("technicalObject").setValueState("Error");
        }
      },

      //Handle Value Help Technical Object
      handleTechnicalObjectVH: function() {
        this._oBasicSearchField = new SearchField();
        this.loadFragment({
          name: "zmassmeasdoc.fragment.TechnicalObjectVH"
        }).then(
          function(oDialog) {
            // console.log(oDialog);
            var oFilterBar = oDialog.getFilterBar();
            this._oVHD = oDialog;

            this.getView().addDependent(oDialog);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog.setRangeKeyFields([
              {
                label: "TechnicalObjectDescription",
                key: "TechnicalObject",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 7
                  }
                )
              }
            ]);

            // Set Basic Search for FilterBar
            oFilterBar.setFilterBarExpanded(true);
            oFilterBar.setBasicSearch(this._oBasicSearchField);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField.attachSearch(function() {
              oFilterBar.search();
            });

            oDialog.getTableAsync().then(
              function(oTable) {
                oTable.setModel(this.oTehcObjVHModel);

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "/ZC_TECHOBJVH",
                    events: {
                      dataReceived: function() {
                        oDialog.update();
                      }
                    }
                  });

                  oTable.addColumn(
                    new UIColumn({
                      label: new Label({ text: "Technical Obj Type" }),
                      template: new Text({
                        wrapping: false,
                        text: "{ZTechnicalObjectType}"
                      })
                    })
                  );

                  oTable.addColumn(
                    new UIColumn({
                      label: new Label({ text: "Technical Object" }),
                      template: new Text({
                        wrapping: true,
                        text: "{TechnicalObject}"
                      })
                    })
                  );

                  oTable.addColumn(
                    new UIColumn({
                      label: new Label({ text: "Description" }),
                      template: new Text({
                        wrapping: true,
                        text: "{TechnicalObjectLabel}"
                      }),
                      demandPopin: "true",
                      popinDisplay: "Inline",
                      minScreenWidth: "Large"
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "/ZC_TECHOBJVH",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{ZTechnicalObjectType}" }),
                        new Label({ text: "{TechnicalObject}" }),
                        new Label({
                          text: "{TechnicalObjectLabel}",
                          wrapping: true
                        })
                      ]
                    }),
                    events: {
                      dataReceived: function() {
                        oDialog.update();
                      }
                    }
                  });
                  oTable.addColumn(
                    new MColumn({
                      header: new Label({ text: "Technical Obj Type" })
                    })
                  );
                  oTable.addColumn(
                    new MColumn({
                      header: new Label({ text: "Technical Object" })
                    })
                  );
                  oTable.addColumn(
                    new MColumn({
                      header: new Label({ text: "Technical Object Label" }),
                      demandPopin: true,
                      popinDisplay: "Inline",
                      minScreenWidth: "Large"
                    })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            // oDialog.setTokens(this._oInputTechnicalObject.getTokens());
            oDialog.open();
          }.bind(this)
        );
      },

      //Handle when Ok in Dialog is pressed
      onValueHelpOkPress: function(oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oInputTechnicalObject.setTokens(aTokens);
        this._oVHD.close();
        this.byId("technicalObject").setValueState("None");
      },

      //Handle when Filter in Value Help Dialog is search
      onFilterBarSearch: function(oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        var aFilters = aSelectionSet.reduce(function(aResult, oControl) {
          if (oControl.getValue()) {
            aResult.push(
              new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue()
              })
            );
          }

          return aResult;
        }, []);

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "TechnicalObject",
                operator: FilterOperator.Contains,
                value1: sSearchQuery
              }),
              new Filter({
                path: "TechnicalObjectDescription",
                operator: FilterOperator.Contains,
                value1: sSearchQuery
              })
            ],
            and: false
          })
        );

        console.log(aFilters);
        this._filterTable(
          new Filter({
            filters: aFilters,
            and: true
          })
        );
      },

      //Filter Table based on Filter in on FilterBarSearch
      _filterTable: function(oFilter) {
        var oVHD = this._oVHD;

        oVHD.getTableAsync().then(function(oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }

          // This method must be called after binding update of the table.
          oVHD.update();
        });
      },

      //Handle cancel button Value Help Dialog
      onValueHelpCancelPress: function() {
        this._oVHD.close();
      },
      //Handle close button Value Help Dialog
      onValueHelpAfterClose: function() {
        this._oVHD.destroy();
      }
    });
  }
);
