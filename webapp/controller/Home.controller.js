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
    "sap/m/Text",
    "sap/m/ObjectIdentifier",
    "sap/ui/core/Icon"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
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
    Text,
    ObjectIdentifier,
    Icon
  ) {
    "use strict";

    return Controller.extend("zmassmeasdoc.controller.Home", {
      onInit: function () {
        // Value Help Dialog standard use case with filter bar without filter suggestions
        var oInputTechnicalObject = this.byId("technicalObject");
        this._oInputTechnicalObject = oInputTechnicalObject;
        this.oTehcObjVHModel = this.getOwnerComponent().getModel("techObjVH");
        this._oInputobjectnumber = this.byId("objectnumber");
        this._oInputobjectname = this.byId("objectname");
      },

      onChangeObjectType: function (oEvent) {
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
      onSubmit: function () {
        // var technicalObject = this.byId("technicalObject").getTokens();
        // if (technicalObject.length > 0) {
        //   const equipmentid = technicalObject[0].getKey();
        //   const equipmentname = technicalObject[0].getText();
        //   this.getRouter().navTo("Create", {
        //     equipment: equipmentid,
        //     equipmentname: equipmentname
        //   });
        // } else {
        //   this.byId("technicalObject").setValueState("Error");
        // }
        const objectnumber = this.byId("objectnumber").getValue();
        const equipmentname = this.byId("objectname").getValue();
        this.getRouter().navTo("Create", {
          equipment: encodeURIComponent(objectnumber),
          equipmentname: encodeURIComponent(equipmentname)
        });
      },

      //Handle Value Help Technical Object
      handleTechnicalObjectVH: function () {
        const that = this;
        this._oBasicSearchField = new SearchField();
        this.loadFragment({
          name: "zmassmeasdoc.fragment.TechnicalObjectVH"
        }).then(
          function (oDialog) {
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
            this._oBasicSearchField.attachSearch(function () {
              oFilterBar.search();
            });

            oDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(this.oTehcObjVHModel);

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "/ZC_TECHOBJVH",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      }
                    }
                  });

                  oTable.addColumn(
                    new UIColumn({
                      label: new Label({ text: "Technical Object" }),
                      template: new ObjectIdentifier({
                        title: "{TechnicalObjectLabel}",
                        text: "{TechnicalObjectDescription}"
                      })
                    })
                  );

                  oTable.addColumn(
                    new UIColumn({
                      label: new Label({ text: "Object Type" }),
                      template: new Text({
                        wrapping: true,
                        text: "{ZTechnicalObjectType}"
                      })
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
                        new ObjectIdentifier({
                          title: "{TechnicalObjectLabel}",
                          text: "{TechnicalObjectDescription}",
                          wrapping: true
                        }),
                        new Label({ text: "{ZTechnicalObjectType}" })
                      ],
                      press: [that.onValueHelpOkPress, that],
                      type: "Active"
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      }
                    }
                  });
                  oTable.addColumn(
                    new MColumn({
                      header: new Label({ text: "Technical Object" })
                    })
                  );
                  oTable.addColumn(
                    new MColumn({
                      header: new Label({ text: "Object Type" }),
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
      onValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");

        if (aTokens === undefined) {
          var oObject = oEvent.getSource().getBindingContext().getObject();
          var oToken = new sap.m.Token({
            key: oObject.Equipment,
            text: oObject.TechnicalObjectDescription + " (" + oObject.TechnicalObjectLabel + ")"
          });
          this._oInputTechnicalObject.setTokens([oToken]);
        } else {
          // this._oInputRentalObject.setTokens(aTokens);
          this._oInputTechnicalObject.setTokens(aTokens);
          var oObject = Object.values(oEvent.getSource()._oSelectedItems.items)[0];
        }
        this._oVHD.close();
        this.byId("technicalObject").setValueState("None");

        //set Object Name
        this._oInputobjectname.setValue(this._oInputTechnicalObject.getTokens()[0].mProperties.text.split("(")[0].trim());

        //get All data selected
        let selectedData = oObject;
        console.log(selectedData);
        //set object number
        let selectedKey = selectedData.TechnicalObject;
        this._oInputobjectnumber.setValue(selectedKey);

        this.getOwnerComponent().getModel("PassModel").setProperty("/rentalObject", selectedData);
      },

      //Handle when Filter in Value Help Dialog is search
      onFilterBarSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
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
      _filterTable: function (oFilter) {
        var oVHD = this._oVHD;

        oVHD.getTableAsync().then(function (oTable) {
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
      onValueHelpCancelPress: function () {
        this._oVHD.close();
      },
      //Handle close button Value Help Dialog
      onValueHelpAfterClose: function () {
        this._oVHD.destroy();
      }
    });
  }
);
