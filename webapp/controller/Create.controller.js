sap.ui.define(
  [
    "zmassmeasdoc/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/m/Panel",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/DateTimePicker",
    "sap/m/ComboBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "sap/ui/core/CustomData"
  ],
  function (
    Controller,
    MessageBox,
    Filter,
    Panel,
    Label,
    Input,
    DateTimePicker,
    ComboBox,
    JSONModel,
    MessagePopover,
    MessagePopoverItem,
    CustomData
  ) {
    "use strict";
    var sEntityPath;
    return Controller.extend("zmassmeasdoc.controller.Create", {
      onInit: function () {
        this._oMessageManager = sap.ui.getCore().getMessageManager();
        this._oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
        this.oMessagePopover = new MessagePopover({
          items: {
            path: "message>/",
            template: new sap.m.MessagePopoverItem({
              description: "{message>description}",
              type: "{message>type}",
              title: "{message>message}"
            })
          }
        });
        this.oView.setModel(this._oMessageModel, "message");

        this.oRouter = this.getRouter();
        this.oRouter.getRoute("Create").attachPatternMatched(this.onRouteMatched, this);
      },

      onRouteMatched: function (oEvent) {
        const that = this;
        this._oMessageManager.removeAllMessages();
        let oModelPoint = this.getModel("measuringpoint");
        this.oModelText = this.getModel("codetext");
        this.objectnumber = decodeURIComponent(oEvent.getParameters().arguments.equipment);

        this.equipmentid = decodeURIComponent(oEvent.getParameters().arguments.equipment);
        this.equipmentname = decodeURIComponent(oEvent.getParameters().arguments.equipmentname);

        //PASSED DATA
        var passedData = this.getOwnerComponent().getModel("PassModel").getProperty("/rentalObject");
        if (typeof passedData == "undefined") {
          this.getRouter().navTo("RouteHome");
        }
        this.byId("EquipmentId").setValue(this.equipmentname + " (" + passedData.Equipment + ")");

        //create filter by equipment id
        let aFilter = new Filter("Equipment", sap.ui.model.FilterOperator.EQ, this.equipmentid);

        this.mPoints = []; // Array for component ID
        oModelPoint.read("/ZC_AL_MEASURINGPOINTS", {
          filters: [aFilter],
          success: function (oData, oResponse) {
            let results = oData.results;
            if (results.length == 0) {
              // console.log("NO DATA");
              // No Measuring Point
              MessageBox.information("No Measuring Points for " + that.equipmentid, {
                actions: [MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                  that.getRouter().navTo("RouteHome");
                }
              });
            } else {
              results.forEach(function (oContext) {
                // As we have fetched the data already, we build panel from emasruing pints data
                that.createPanel(oContext);
                console.log(that.oMeasPoints);
              });
            }
          },
          error: function (oError) {
            console.log(oError);
          }
        });

        // Code for Odata V4
        // let oList = oModelPoint.bindList(
        //   "/ZC_AL_MEASURINGPOINTS",
        //   undefined,
        //   undefined,
        //   aFilter,
        //   undefined
        // );

        // oList.requestContexts(0, 100).then(function(aContexts) {
        //   if (aContexts.length == 0) {
        //     // console.log("NO DATA");
        //     // No Measuring Point
        //     MessageBox.information(
        //       "No Measuring Points for " + that.equipmentid,
        //       {
        //         actions: [MessageBox.Action.OK],
        //         emphasizedAction: MessageBox.Action.OK,
        //         onClose: function(sAction) {
        //           that.getRouter().navTo("RouteHome");
        //         }
        //       }
        //     );
        //   } else {
        //     aContexts.forEach(function(oContext) {
        //       // As we have fetched the data already, we build panel from emasruing pints data
        //       that.createPanel(oContext);
        //     });
        //   }
        // });
      },

      /**
       * Function for create Panel for each measuring point.
       * create array this.mPoint for stored id for each element
       * @public
       */
      createPanel: function (oItem) {
        console.log(oItem);
        let oPage = this.getView().byId("pageCreate");
        let that = this;
        let MeasuringPoint = oItem.MeasuringPoint;
        let MeasuringPointDescription = oItem.MeasuringPointDescription;
        let MeasurementRangeUnit = oItem.MeasurementRangeUnit;
        let MeasuringPointIsCounter = oItem.MeasuringPointIsCounter;
        let ValuationCodeIsSufficient = oItem.ValuationCodeIsSufficient;
        let MeasuringPointCodeGroup = oItem.MeasuringPointCodeGroup;
        let equipment = oItem.Equipment;
        let MeasuringPointTargetValue = Math.ceil(oItem.TargetConverted);
        // let MeasuringPoint = oItem.getProperty("MeasuringPoint");
        let today = new Date();
        let read_by = sap.ushell.Container.getService("UserInfo").getId();

        // Define varibale for each component ID
        let panelId = this.createId("panel." + MeasuringPoint);
        let ireadingId, idifferenceId, itargetId, iLastCounterId, iLastDateTimeId, ivalcodeId;

        // Create a panel for each item

        var oPanel = new Panel(panelId, {
          headerText: MeasuringPoint + " - " + MeasuringPointDescription,
          expandable: true,
          width: "auto"
        });
        oPanel.addStyleClass("sapUiResponsiveMargin");

        // Create labels and inputs within the panel
        var oLabel1 = new Label({ text: "Measuring Point" });
        var oInput1 = new Input({
          value: MeasuringPoint + " - " + MeasuringPointDescription,
          editable: false
        });
        oInput1.addStyleClass("sapUiTinyMarginBottom");
        oPanel.addContent(oLabel1);
        oPanel.addContent(oInput1);

        // Check for Measuring Point type
        if (MeasuringPointIsCounter && !ValuationCodeIsSufficient) {
          // console.log("Input REading and Difference");
          ireadingId = this.createId("reading." + MeasuringPoint);
          idifferenceId = this.createId("difference." + MeasuringPoint);
          iLastCounterId = that.createId("lastcounter." + MeasuringPoint);
          iLastDateTimeId = that.createId("lastdatetime." + MeasuringPoint);

          //Input Reading
          var oLabel2 = new Label({ text: "Reading" });
          var oInput2 = new Input(ireadingId, {
            description: MeasurementRangeUnit,
            type: "Number",
            customData: [
              {
                Type: "sap.ui.core.CustomData",
                key: "iLastCounterId",
                value: iLastCounterId // bind custom data
              },
              {
                Type: "sap.ui.core.CustomData",
                key: "idifferenceId",
                value: idifferenceId // bind custom data
              }
            ],
            change: [this.checkReading, this]
          });
          oInput2.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel2);
          oPanel.addContent(oInput2);

          //Input Difference
          var oLabel3 = new Label({ text: "Difference" });
          var oInput3 = new Input(idifferenceId, {
            description: MeasurementRangeUnit,
            type: "Number",
            customData: [
              {
                Type: "sap.ui.core.CustomData",
                key: "iLastCounterId",
                value: iLastCounterId // bind custom data
              },
              {
                Type: "sap.ui.core.CustomData",
                key: "ireadingId",
                value: ireadingId // bind custom data
              }
            ],
            // liveChange: [this.checkMinus, this],
            change: [this.checkDifference, this]
          });
          oInput3.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel3);
          oPanel.addContent(oInput3);

          //Input Last Counter Reading
          var oLabel7 = new Label({ text: "Last Counter" });
          var oInput7 = new Input(iLastCounterId, {
            description: MeasurementRangeUnit,
            editable: false
          });
          oInput7.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel7);
          oPanel.addContent(oInput7);

          //Input Last Date Time Reading
          var oInput8 = new DateTimePicker(iLastDateTimeId, {
            editable: false,
            visible: false
          });
          oInput8.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oInput8);

          // get last value for each measuring point
          this.getLastMeasurementDoc(MeasuringPoint, oInput7, oInput8);
        } else if (!MeasuringPointIsCounter && !ValuationCodeIsSufficient) {
          // console.log("Input REading");
          ireadingId = this.createId("reading." + MeasuringPoint);
          itargetId = this.createId("target." + MeasuringPoint);
          var oLabel2 = new Label({ text: "Reading" });
          var oInput2 = new Input(ireadingId, {
            description: MeasurementRangeUnit,
            customData: [
              {
                Type: "sap.ui.core.CustomData",
                key: "itargetId",
                value: itargetId // bind custom data
              }
            ],
            change: [this.checkReading, this]
          });
          oInput2.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel2);
          oPanel.addContent(oInput2);

          //Input Target
          var oLabel3 = new Label({ text: "Target" });
          var oInput3 = new Input(itargetId, {
            value: MeasuringPointTargetValue,
            description: MeasurementRangeUnit,
            editable: false
          });
          oInput3.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel3);
          oPanel.addContent(oInput3);
        } else if (!MeasuringPointIsCounter && ValuationCodeIsSufficient) {
          // console.log("Input Valuation");
          ivalcodeId = this.createId("valcode." + MeasuringPoint);
          var oLabel9 = new Label({ text: "Valuation Code" });
          var oInput9 = new ComboBox(ivalcodeId, {
            width: "100%",
            items: {
              path: "CodeTexts>/",
              template: new sap.ui.core.Item({
                key: "{CodeTexts>Code}",
                text: "{CodeTexts>Kurztext}"
              })
            }
          });
          oInput9.addStyleClass("sapUiTinyMarginBottom");
          oPanel.addContent(oLabel9);
          oPanel.addContent(oInput9);
          this.getCodeTexts(MeasuringPointCodeGroup, this.oModelText, oInput9);
        }

        //Input Date Time Reading
        let idatetimeId = this.createId("datetime." + MeasuringPoint);
        var oLabel4 = new Label({ text: "Date Time" });
        var oInput4 = new DateTimePicker(idatetimeId, {
          valueFormat: "yyyy-MM-dd HH:mm:ss",
          displayFormat: "dd MMM yyyy HH:mm:ss"
        });
        oInput4.setDateValue(today);
        oInput4.addStyleClass("sapUiTinyMarginBottom");

        //Input Reading by
        let ireadbyId = this.createId("readby." + MeasuringPoint);
        var oLabel5 = new Label({ text: "Read By" });
        var oInput5 = new Input(ireadbyId, {
          value: read_by
        });
        oInput5.addStyleClass("sapUiTinyMarginBottom");

        //Inpout Free Text
        let itextId = this.createId("text." + MeasuringPoint);
        var oLabel6 = new Label({ text: "Text" });
        var oInput6 = new Input(itextId, {});
        oInput6.addStyleClass("sapUiTinyMarginBottom");

        // Add labels and inputs to the panel
        oPanel.addContent(oLabel4);
        oPanel.addContent(oInput4);
        oPanel.addContent(oLabel5);
        oPanel.addContent(oInput5);
        oPanel.addContent(oLabel6);
        oPanel.addContent(oInput6);

        // Add the panel to the panel container
        oPage.addContent(oPanel);

        //add panel to array
        this.mPoints.push({
          smeasuringpoint: MeasuringPoint,
          spanelId: panelId,
          sreadingId: ireadingId,
          sdifferenceId: idifferenceId,
          stargetId: itargetId,
          sLastCounterId: iLastCounterId,
          sdatetimeId: idatetimeId,
          sreadbyId: ireadbyId,
          stextId: itextId,
          svalcodeId: ivalcodeId,
          sMeasurementRangeUnit: MeasurementRangeUnit
        });

        this.oMeasPoints = this.mPoints.reduce(function (result, item) {
          result[item.smeasuringpoint] = item;
          return result;
        }, {});
      },
      /**
       * Event handler for Reading Input Validation.
       * It will handle for measuring point with target and with reading counter
       * Reading Input value state will have ERROR valuestate if lower than previous measuring document
       * @public
       */
      checkReading: function (oEvent) {
        let ireading = this.byId(oEvent.getParameter("id"));
        let iLastCounter = this.byId(oEvent.getSource().data("iLastCounterId"));
        let idifference = this.byId(oEvent.getSource().data("idifferenceId"));
        let itargetId = this.byId(oEvent.getSource().data("itargetId"));

        //Check if measuring type is with target or not
        if (itargetId == null) {
          // let lastCounter = iLastCounter.getValue();
          let difference = idifference.setValue(ireading.getValue() - iLastCounter.getValue());
          if (difference.getValue() <= 0) {
            ireading.setValueState("Error");
            ireading.setValueStateText("Counter Reading is smaller than previous document.");
          } else {
            ireading.setValueState("None");
          }
        } else {
          let reading = parseFloat(ireading.getValue());
          let target = parseFloat(itargetId.getValue());

          if (reading < target) {
            ireading.setValueState("Error");
            ireading.setValueStateText("Counter Reading is smaller than Target.");
          } else {
            ireading.setValueState("None");
          }
        }
      },

      /**
       * Event handler for Validate Input Difference.
       * It will handle for measuring point reading counter difference
       * @public
       */
      checkDifference: function (oEvent) {
        let idifference = this.byId(oEvent.getParameter("id"));
        let iLastCounter = this.byId(oEvent.getSource().data("iLastCounterId"));
        let ireading = this.byId(oEvent.getSource().data("ireadingId"));
        let valueDifference = idifference.getValue();
        valueDifference = valueDifference.replace(/[^\d]/g, "");
        idifference.setValue(valueDifference);
        ireading.setValue(parseInt(valueDifference) + parseInt(iLastCounter.getValue()));

        ireading.setValueState("None");
      },

      /**
       * Async Function for getLast Measurement Document for each Measuring Point.
       * It called in function createPanel()
       * Using Odata V4
       * @public
       * @param {object} mPoint array element ID
       * @param {object} oInput7 Input for Previous Counter
       * @param {object} oInput8 Input for Previous Input Date
       */
      getLastMeasurementDoc: async function (mpoint, oInput7, oInput8) {
        //GET LAST Value of Measurement Doc by Measurement Point
        let oModel = this.getOwnerComponent().getModel("measurementdocument");
        let oDoc = oModel.bindList("/MeasurementDocument");
        let sFilter = "(MeasuringPoint eq '" + mpoint + "')";
        let lastmeasdoc = {};
        oDoc.changeParameters({
          $select:
            "MeasurementDocument,MeasuringPoint,MeasurementReading,MeasurementCounterReading,MsmtCounterReadingDifference,MeasurementReadingInEntryUoM,MsmtDocumentSIUnitOfMeasure,MsmtRdngDate,MsmtRdngTime",
          $filter: sFilter,
          $orderby: "MeasuringPoint,MeasurementDocument desc,MsmtRdngDate desc,MsmtRdngTime desc"
        });
        oDoc.requestContexts(0, 1).then(function (aContexts) {
          aContexts.forEach(function (oContext) {
            // As we have fetched the data already, we can access "Note" through getProperty
            lastmeasdoc["TotalDiff"] = oContext.getProperty("MeasurementReadingInEntryUoM");
            lastmeasdoc["lastdatetime"] = oContext.getProperty("MsmtRdngDate") + " " + oContext.getProperty("MsmtRdngTime");
            lastmeasdoc["lastdatetime"] = new Date(lastmeasdoc["lastdatetime"]);
            oInput7.setValue(lastmeasdoc["TotalDiff"]);
            oInput8.setDateValue(lastmeasdoc["lastdatetime"]);
          });
        });
        // console.log("lastmeasdoc");
        // console.log(lastmeasdoc);
        return lastmeasdoc;
      },

      /**
       * Function for get Code Texts for each Valuation Code.
       * It called in function createPanel()
       * Using Odata V4
       * @public
       * @param {string} codeGroup code group in Valuation Code
       * @param {model} oModelText Model codetext
       * @param {object} oInput9 Combobox for code group texts
       */
      getCodeTexts: function (codeGroup, oModelText, oInput9) {
        let oSelect = oInput9;
        let oJSONModel = new JSONModel();
        // console.log(oModelText);
        let oFilter = new Filter("Codegruppe", "EQ", codeGroup);
        oModelText.read("/CodeTextsSet", {
          filters: [oFilter],
          success: function (response) {
            console.log(response.results);
            oJSONModel.setData(response.results);
            oSelect.setModel(oJSONModel, "CodeTexts");
          }.bind(this),
          error: function (error) {
            console.log(error);
          }
        });
      },
      onSave: async function (oEvent) {
        // console.log(this.oMeasPoints);
        this._oMessageManager.removeAllMessages();
        this.newDoc = [];
        let that = this;
        let oModelMeasDoc = this.getModel("measurementdocument");
        let batchRequest = [];
        let mParameters = { $$groupId: "batchCreate" };
        let measdocumentList = oModelMeasDoc.bindList(
          "/MeasurementDocument",
          null, //oContext
          null, //vSorters
          null, //vFilters
          mParameters
        );

        // get Button message
        var oButton = this.getView().byId("btnPopOver");

        Object.entries(this.mPoints).forEach(([key, element]) => {
          //create variable from value
          let vMeasuringPoint = element.smeasuringpoint;
          let idatetime = this.byId(element.sdatetimeId).getValue();
          let ddate = idatetime.split(" ")[0];
          let dtime = idatetime.split(" ")[1];
          let vMsmtRdngByUser = this.byId(element.sreadbyId).getValue();
          let vMeasurementDocumentText = this.byId(element.stextId).getValue();

          // check measuring point type
          if (element.svalcodeId == null) {
            // measuring point without valuation code
            let vMeasurementCounterReading = parseInt(this.byId(element.sreadingId).getValue());
            let vMeasurementReadingEntryUoM = element.sMeasurementRangeUnit;
            if (vMeasurementCounterReading) {
              var oMeasurementDoc = {
                MeasuringPoint: vMeasuringPoint,
                MsmtRdngDate: ddate,
                MsmtRdngTime: dtime,
                MsmtRdngByUser: vMsmtRdngByUser,
                MeasurementDocumentText: vMeasurementDocumentText,
                MeasurementCounterReading: vMeasurementCounterReading,
                MeasurementReadingEntryUoM: vMeasurementReadingEntryUoM
              };
              var oDocCreate = measdocumentList.create(oMeasurementDoc, true);
              oDocCreate.created().then(function () {
                // that.newDoc[vMeasuringPoint] = oDocCreate.getProperty("MeasurementDocument");
                successResult[vMeasuringPoint].measurementDocument = oDocCreate.getProperty("MeasurementDocument");
                console.log(successResult);
              });
            } else {
              console.log(vMeasuringPoint + " Tidak Diisi");
            }
          } else if (element.svalcodeId != null) {
            // measuring point with valuation code
            let vMsmtValuationCode = this.byId(element.svalcodeId).getSelectedKey();
            if (vMsmtValuationCode != "") {
              var oMeasurementDoc = {
                MeasuringPoint: vMeasuringPoint,
                MsmtRdngDate: ddate,
                MsmtRdngTime: dtime,
                MsmtRdngByUser: vMsmtRdngByUser,
                MeasurementDocumentText: vMeasurementDocumentText,
                MsmtValuationCode: vMsmtValuationCode
              };
              var oDocCreate = measdocumentList.create(oMeasurementDoc, true);
              oDocCreate.created().then(function () {
                // that.newDoc[vMeasuringPoint] = oDocCreate.getProperty("MeasurementDocument");
                successResult[vMeasuringPoint].measurementDocument = oDocCreate.getProperty("MeasurementDocument");
                console.log(successResult);
              });
            } else {
              console.log(vMeasuringPoint + " Tidak Diisi");
            }
          }

          // console.log(oMeasurementDoc);
        });
        oModelMeasDoc.submitBatch("batchCreate");
        let successResult = [];
        let errorResult = [];
        measdocumentList.attachCreateCompleted((oEvent) => {
          let { context, success } = oEvent.getParameters();
          let oObject = context.getObject();
          if (!success) {
            var oModelMessage = sap.ui.getCore().getMessageManager().getMessageModel();
            that.oMessagePopover.setModel(oModelMessage, "message");
            errorResult.push({ success: success, object: oObject });
          } else {
            successResult[oObject.MeasuringPoint] = { success: success, object: oObject };
            console.log(successResult);
            successResult.forEach((item) => {
              // sinfotext = sinfotext + "Measurement Document for Measuring Point " + item.smeasuringpoint + " successfully created." + "\n";
              console.log(item);
            });
          }
        }, this);

        // oModelMeasDoc
        //   .submitBatch("batchCreate")
        //   .then(function () {
        //     console.log("start " + measdocumentList.isTransient());
        //     if (!measdocumentList.hasPendingChanges()) {
        //       // raise success message
        //       console.log("success");
        //     } else {
        //       // Check error message from batch request.
        //       var oModelMessage = sap.ui.getCore().getMessageManager().getMessageModel();
        //       that.oMessagePopover.setModel(oModelMessage, "message");
        //       // that.oMessagePopover.openBy(oButton);
        //     }
        //   })
        //   .catch(function (oError) {
        //     MessageBox.alert(oError.message, {
        //       icon: MessageBox.Icon.ERROR,
        //       title: "Unexpected Error"
        //     });
        //   })
        //   .finally(function () {
        //     // console.log(measdocumentList.hasPendingChanges());
        //     // var oModelMessage = sap.ui.getCore().getMessageManager().getMessageModel();
        //     // console.log(oModelMessage);
        //   });

        // let sinfotext = "";
        // this.mPoints.forEach(item => {
        //   sinfotext =
        //     sinfotext +
        //     "Measurement Document for Measuring Point " +
        //     item.smeasuringpoint +
        //     " successfully created." +
        //     "\n";
        // });
        // console.log(sinfotext);
        // MessageBox.success(sinfotext, {
        //   actions: [MessageBox.Action.OK],
        //   emphasizedAction: MessageBox.Action.OK,
        //   onClose: function(sAction) {
        //     window.history.go(-1);
        //   }
        // });
      },
      onTest: function (oEvent) {
        console.log(this._oMessageModel);
        console.log(this._oMessageModel.getData());
      },

      openMsgList: function (oEvent) {
        this.oMessagePopover.openBy(oEvent.getSource());
      },
      onCancel: function (oEvent) {
        let that = this;
        console.log(this.mPoints);
        this.mPoints.forEach((item) => {
          that.byId(item.spanelId).destroy();
        });
        this.getRouter().navTo("RouteHome");
      }
    });
  }
);
