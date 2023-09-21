sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zmassmeasdoc/model/formatter"
  ],
  function(
    Controller,
    History,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    MessageBox,
    formatter
  ) {
    "use strict";

    return Controller.extend("zmassmeasdoc.controller.BaseController", {
      formatter: formatter,
      /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
      getRouter: function() {
        return this.getOwnerComponent().getRouter();
      },

      /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
      getModel: function(sName) {
        return this.getView().getModel(sName);
      },

      /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
      setModel: function(oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
      getResourceBundle: function() {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      /**
         * Event handler for navigating back.
         * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
      onNaviBack: function() {
        var sPreviousHash = History.getInstance().getPreviousHash(),
          oCrossAppNavigator = sap.ushell.Container.getService(
            "CrossApplicationNavigation"
          ),
          bReplace = sap.ui.Device.system.phone ? false : true;

        if (
          sPreviousHash !== undefined ||
          !oCrossAppNavigator.isInitialNavigationAsync()
        ) {
          history.go(-1);
        } else {
          this.getRouter().navTo("Home", {}, bReplace);
        }
      },

      /**
         * Event handler for Search Table or List .
         * If There is Query Parameter inputed in Search box it will Searhc the item filter
         * Parameter Fieldname and Table ID
         * @public
         */
      onSearch: function(oEvent, sField, sId) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter(sField, FilterOperator.Contains, sQuery)
          ];
        }

        this.getView()
          .byId(sId)
          .getBinding("items")
          .filter(oTableSearchState, "Application");
      },

      /**
         * Event handler for Sort Table or List .
         * If There is Query Parameter inputed in Search box it will Searhc the item filter
         * @public
         */
      onSort: function(oEvent, sField, sId, bDescendingSort) {
        // console.log(bDescendingSort);
        bDescendingSort = !bDescendingSort;
        var oView = this.getView(),
          oTable = oView.byId(sId),
          oBinding = oTable.getBinding("items"),
          oSorter = new Sorter(sField, bDescendingSort);
        oBinding.sort(oSorter);
      },
      /**
         * Event handler for Get Value from form .
         * @param {sap.ui.core.mvc.View} oView the VIew instance
         * @param {array} oFields array list of fields 
         * ID of Input Components must be same with field name
         * Supported Components: Input, Datepicker, timepicker, Text Area
         * @public
         */
      getValues: function(oView, ofields) {
        var payload = {};
        for (var field of ofields) {
          var input = oView.byId(field);

          switch (input.getMetadata().getName()) {
            case "sap.m.ComboBox":
              payload[field] = input.getSelectedKey();
              break;
            case "sap.m.TimePicker":
              //format time XDS: "PT01H01M00S"
              payload[field] = formatter.Time(input.getValue());
              break;
            case "sap.m.DatePicker":
              //format Date: "2023-12-31T23:59:00"
              payload[field] = formatter.FormatDate(input.getValue());
              break;
            case "sap.m.Input":
              if (input.getType() == "Number") {
                payload[field] = parseFloat(input.getValue());
              } else {
                payload[field] = input.getValue();
              }
              break;
            default:
              payload[field] = input.getValue();
              break;
          }
        }
        return payload;
      },
      /**
         * Event handler for Create Operation .
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {object} payload the payload json data
         * @param {string} entity the string entity path 
         * @public
         */
      onCreate: function(oModel, payload, entity) {
        // return payload;
        return new Promise((resolve, reject) => {
          oModel.create(entity, payload, {
            success: function(oData, oResponse) {
              // Success
              resolve(oResponse);
            }.bind(this),
            error: function(oError) {
              // console.log(oError)
              reject(oError);
            }
          });
        });
      },
      /**
         * Event handler for Update Operation .
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {object} payload the payload json data
         * @param {string} entity the string entity path 
         * @public
         */
      onEdit: function(oModel, payload, entity) {
        // return payload;
        return new Promise((resolve, reject) => {
          oModel.update(entity, payload, {
            success: function(oData, oResponse) {
              // Success
              resolve(oResponse);
            }.bind(this),
            error: function(oError) {
              // console.log(oError)
              reject(oError);
            }
          });
        });
      },
      /**
         * Event handler for Empty Form .
         * @param {sap.ui.core.mvc.View} oView the model instance
         * @param {array} oFields array list of fields 
         * @public
         */
      resetForm: function(oView, ofields) {
        for (var field of ofields) {
          var input = oView.byId(field);
          switch (input.getMetadata().getName()) {
            case "sap.m.ComboBox":
              input.setSelectedKey("");
              break;
            default:
              input.setValue("");
              break;
          }
        }
      },
      /**
         * Event handler for bind model to View.
         * @param {sap.ui.core.mvc.View} oView the model instance
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} entity the string entity path 
         * @public
         */
      bindView: function(oView, oModel, sEntityPath) {
        oView.setModel(oModel);
        oView.bindElement(sEntityPath);
      }
    });
  }
);
// This Apps is developed by: Ahmad Lutfiadi
// PT NTT Data Business Solution
