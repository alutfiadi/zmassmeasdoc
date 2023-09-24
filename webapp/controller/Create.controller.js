sap.ui.define(
  [
    "zmassmeasdoc/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/m/Panel",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/DateTimePicker"
  ],
  function(
    Controller,
    MessageBox,
    Filter,
    Panel,
    Label,
    Input,
    DateTimePicker
  ) {
    "use strict";
    var sEntityPath;
    return Controller.extend("zmassmeasdoc.controller.Create", {
      onInit: function() {
        this.oRouter = this.getRouter();
        this.oRouter
          .getRoute("Create")
          .attachPatternMatched(this.onRouteMatched, this);
      },

      onRouteMatched: function(oEvent) {
        const that = this;
        let oModelPoint = this.getModel("measuringpoint");
        this.equipmentid = oEvent.getParameters().arguments.equipment;
        this.equipmentname = oEvent.getParameters().arguments.equipmentname;
        let aFilter = new Filter(
          "Equipment",
          sap.ui.model.FilterOperator.EQ,
          this.equipmentid
        );

        let oList = oModelPoint.bindList(
          "/MeasuringPoint",
          undefined,
          undefined,
          aFilter,
          undefined
        );

        this.byId("EquipmentId").setValue(this.equipmentname);
        this.mPoints = [];
        oList.requestContexts(0, 100).then(function(aContexts) {
          if (aContexts.length == 0) {
            // console.log("NO DATA");
            // No Measuring Point
            MessageBox.information(
              "No Measuring Points for " + that.equipmentid,
              {
                actions: [MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function(sAction) {
                  that.getRouter().navTo("RouteHome");
                }
              }
            );
          } else {
            aContexts.forEach(function(oContext) {
              // As we have fetched the data already, we build panel from emasruing pints data
              that.createPanel(oContext);
            });
          }
        });
      },

      createPanel: function(oItem) {
        let oPage = this.getView().byId("pageCreate");
        let MeasuringPoint = oItem.getProperty("MeasuringPoint");
        let MeasuringPointDescription = oItem.getProperty(
          "MeasuringPointDescription"
        );
        let CharcValueUnit = oItem.getProperty("CharcValueUnit");
        let today = new Date();
        let read_by = sap.ushell.Container.getService("UserInfo").getId();
        let equipment = oItem.getProperty("Equipment");

        // Create a panel for each item
        let panelId = this.createId("panel" + MeasuringPoint);
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

        let ireadingId = this.createId("reading" + MeasuringPoint);
        var oLabel2 = new Label({ text: "Reading" });
        var oInput2 = new Input(ireadingId, {
          description: CharcValueUnit
        });
        oInput2.addStyleClass("sapUiTinyMarginBottom");

        let idifferenceId = this.createId("difference" + MeasuringPoint);
        var oLabel3 = new Label({ text: "Difference" });
        var oInput3 = new Input(idifferenceId, {
          description: CharcValueUnit
        });
        oInput3.addStyleClass("sapUiTinyMarginBottom");

        let idatetimeId = this.createId("datetime" + MeasuringPoint);
        var oLabel4 = new Label({ text: "Date Time" });
        var oInput4 = new DateTimePicker(idatetimeId, {
          valueFormat: "yyyy-MM-dd HH:mm:ss",
          displayFormat: "dd MMM yyyy HH:mm:ss"
        });
        oInput4.setDateValue(today);
        oInput4.addStyleClass("sapUiTinyMarginBottom");

        let ireadbyId = this.createId("readby" + MeasuringPoint);
        var oLabel5 = new Label({ text: "Read By" });
        var oInput5 = new Input(ireadbyId, {
          value: read_by
        });
        oInput5.addStyleClass("sapUiTinyMarginBottom");

        let itextId = this.createId("text" + MeasuringPoint);
        var oLabel6 = new Label({ text: "Text" });
        var oInput6 = new Input(itextId, {});
        oInput6.addStyleClass("sapUiTinyMarginBottom");

        // Add labels and inputs to the panel
        oPanel.addContent(oLabel1);
        oPanel.addContent(oInput1);
        oPanel.addContent(oLabel2);
        oPanel.addContent(oInput2);
        oPanel.addContent(oLabel3);
        oPanel.addContent(oInput3);
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
          sdatetimeId: idatetimeId,
          sreadbyId: ireadbyId,
          stextId: itextId
        });
      },
      onSave: function() {
        let sinfotext = "";
        this.mPoints.forEach(item => {
          sinfotext =
            sinfotext +
            "Measurement Document for Measuring Point " +
            item.smeasuringpoint +
            " successfully created." +
            "\n";
        });
        console.log(sinfotext);
        MessageBox.success(sinfotext, {
          actions: [MessageBox.Action.OK],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function(sAction) {
            window.history.go(-1);
          }
        });
      },
      onCancel: function(oEvent) {
        let that = this;
        console.log(this.mPoints);
        this.mPoints.forEach(item => {
          that.byId(item.spanelId).destroy();
        });
        this.getRouter().navTo("RouteHome");
      }
      //   onEditCarrier: async function() {
      //     var that = this,
      //       oView = this.getView(),
      //       oModel = this.getModel();
      //     var fields = ["CarrierId", "Name", "CurrencyCode"];
      //     var payload = this.getValues(this.oView, fields);
      //     try {
      //       var res = await this.onEdit(this.oModel, payload, this.sEntityPath);
      //       oModel.refresh(true);
      //       MessageBox.show("Edit Success", {
      //         icon: MessageBox.Icon.SUCCESS,
      //         title: "Success",
      //         actions: [MessageBox.Action.OK],
      //         onClose: function(oAction) {
      //           that.onNaviBack();
      //         }
      //       });
      //     } catch (e) {
      //       var errmessage = JSON.parse(e.responseText);
      //       MessageBox.error(errmessage.error.message.value);
      //     }
      //   }
    });
  }
);
