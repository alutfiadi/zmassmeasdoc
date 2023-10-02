sap.ui.define([], function() {
  "use strict";

  return {
    Time: function(val) {
      if (val) {
        val = val.replace(/^PT/, "").replace(/S$/, "");
        val = val.replace("H", ":").replace("M", ":");

        var multipler = 60 * 60;
        var result = 0;
        val.split(":").forEach(function(token) {
          result += token * multipler;
          multipler = multipler / 60;
        });
        var timeinmiliseconds = result * 1000;

        var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
          pattern: "PTHH'H'mm'M'ss'S'"
        });
        var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
        return timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
      }
      return null;
    },
    FormatDate: function(val) {
      if (val) {
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "yyyy-MM-ddThh:mm:ss"
        });
        return dateFormat.format(new Date(val));
      }
      return null;
    },
    ObjectTypeIcon: function(val) {
      let icon;
      if (val == "EAMS_EQUI") {
        icon = "sap-icon://technical-object";
      } else {
        icon = "sap-icon://functional-location";
      }
      return icon;
    }
  };
});
