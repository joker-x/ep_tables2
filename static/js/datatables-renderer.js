if (typeof (DatatablesRenderer) == 'undefined') var DatatablesRenderer = function () {
        var dRenderer = {
            render: function (params, element, attributes) {
		// Strange behaviour from IE. 
                // It comes here 2 times per row, so I have to stop rendering a second time to avoid desctruction of the rendering
		if (params != "timeslider" && element.innerHTML && element.innerHTML.indexOf("payload") != 2) return;

                var renderer = new DatatablesRenderer.Renderer();
                if (params == "timeslider") {
                  var regex1 = new RegExp('(^\<span\ class=""\>)', 'i');
                  var regex2 = new RegExp('(\<\/span\>)$', 'i');
                  code = renderer.htmlspecialchars_decode(element.innerHTML)
                           .replace(regex1, '')
                           .replace(regex2, '');
                } else if (params == "export") {
                  code = element.text;
                } else if (element.innerText) code = element.innerText;
                else code = element.textContent;

                if (params == "export") {
                  // For export, I need to send back the formatted text
                  return renderer.getHtml(code, attributes);
                } else {
                  // For others, I need to modify the content of the element
                  element.innerHTML = renderer.getHtml(code, attributes);
                }
            }
        }; // end of dRenderer
        dRenderer.Renderer = function () {
            //	
        };
        dRenderer.Renderer.prototype = {
            createDefaultTblProperties: function (authors) {
                return {
                    borderWidth: "1",
                    cellAttrs: [],
                    width: "100",
                    rowAttrs: {},
                    colAttrs: [],
                    authors: {}
                };
            },
            buildTabularData: function (tblJSONObj, tblPropsJSString) {
                var htmlTbl = "";
                var tblId = tblJSONObj.tblId;
                var tblClass = tblJSONObj.tblClass;
                var tdClass = tblJSONObj.tdClass;
                var trClass = tblJSONObj.trClass;
                var payload = tblJSONObj.payload;
                var tblProperties = {};
                try {
                    tblProperties = JSON.parse(tblPropsJSString);
                } catch (error) {
                    tblProperties = this.createDefaultTblProperties();
                }
                var isFirstRow = typeof (tblProperties) == 'undefined' || tblProperties == null || typeof (tblProperties.isFirstRow) == 'undefined'? false : tblProperties.isFirstRow;
                var rowAttrs = tblProperties.rowAttrs;
                var singleRowAttrs = rowAttrs.singleRowAttrs;
                var cellAttrs = tblProperties.cellAttrs;
                var colAttrs = tblProperties.colAttrs;
                var tblWidth = typeof (tblProperties) == 'undefined' || tblProperties == null ? "100" : tblProperties.width || "100";
                var tblHeight = typeof (tblProperties) == 'undefined' || tblProperties == null ? "15" : tblProperties.height || "15";
                var tblBorderWidth = typeof (tblProperties) == 'undefined' || tblProperties == null ? 0 : tblProperties.borderWidth || 0;
                var tblBorderColor = typeof (tblProperties) == 'undefined' || tblProperties == null ? "#000000" : tblProperties.borderColor || "#000000";
                var currRow = tblProperties.currRowAuthorIdx;
                var currCell = tblProperties.currCellAuthorIdx;
                var authors = tblProperties.authors;
                var printViewTBlStyles = "table-layout:fixed !important;border-collapse:collapse!important;font-family:Trebuchet MS!important;";
                var printViewTblTDStyles = "font-size: 1em!important;line-height: 1em!important;padding: 3px 7px 2px!important;word-wrap: break-word!important;"
                var htmlTbl = "<table class='" + tblClass + "' style='" + printViewTBlStyles + "background-color:white;width:" + tblWidth + "%!important;height:" + tblHeight + "px!important;'><tbody>";
                var bordersBottom = "border-bottom:" + tblBorderWidth + "px solid " + tblBorderColor;
                var bordersTop = "border-top:" + tblBorderWidth + "px solid " + tblBorderColor;
                var rowVAlign = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? "left" : rowAttrs.rowVAlign || "left";
                var rows = tblJSONObj.payload;
                var evenRowBgColor = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? "#FFFFFF" : rowAttrs.evenBgColor || "#FFFFFF";
                var oddRowBgColor = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? null : rowAttrs.oddBgColor || null;
                for (var j = 0, rl = rows.length; j < rl; j++) {
                    var tds = rows[j];
                    var rowBgColor = oddRowBgColor;
                    if (!rowBgColor) {
                        rowBgColor = evenRowBgColor;
                    }
                    htmlTbl += "<tr style='vertical-align:" + rowVAlign + ";background-color:" + rowBgColor + "; " + bordersBottom + "!important;";
                    if (isFirstRow) htmlTbl += " " + bordersTop + "!important;";
                    htmlTbl += "' class='" + trClass + "'>";
                    var preHeader = "";
                    if (j == 0) {
                        preHeader = "{\"payload\":[[\"";
                    }
                    htmlTbl += "<td  name='payload' class='hide-el overhead' style='display:none;'>" + preHeader + "</td>";
                    var singleRowAttr = typeof (singleRowAttrs) == 'undefined' || singleRowAttrs == null ? null : singleRowAttrs[j];
                    for (var i = 0, tl = tds.length; i < tl; i++) {
                        var cellAttr = typeof (cellAttrs[j]) == 'undefined' || cellAttrs[j] == null ? null : cellAttrs[j][i];
                        var cellStyles = this.getCellAttrs(singleRowAttr, cellAttr, colAttrs[i], authors, i, j);
                        
                        var borderTop = "";
                        if (tblBorderWidth == 0) {
                            borderTop = " border-top: 0px solid white !important;";
                        }
                        //col vAlign
                        var colVAlign = typeof (colAttrs[i]) == 'undefined' || colAttrs[i] == null ? "" : "align='" + colAttrs[i].colVAlign + "'" || "";
                        var quoteAndComma = "\",\"";
                        var cellDel = "";
                        var delimCell = "<td name='delimCell' id='" + "' class='hide-el overhead' style='display:none;'>" + quoteAndComma + "</td>";
                        var lastCellBorder = "";
                        if (i == tl - 1) {
                            delimCell = "";
                            lastCellBorder = "border-right:" + tblBorderWidth + "px solid " + tblBorderColor + "!important;";
                            quoteAndComma = "";
                        }
                        tds[i] = this.setLinks(tds[i]);
                        if (tds[i].indexOf('/r/n') != -1) {
                            cellsWithBr = "";
                            var tdText = tds[i].split('/r/n');
                            for (var k = 0; k < tdText.length; k++) {
                                if (k < tdText.length - 1) {
                                    cellsWithBr += tdText[k] + "<label value='tblBreak' class='hide-el' style='display:none;'>/r/n</label><label class='tblBreak' style='display:block;'></label>";
                                } else cellsWithBr += tdText[k];
                            }
                            htmlTbl += "<td  name='tData' " + colVAlign + " style='" + printViewTblTDStyles + cellStyles + " border-left:" + 
                            tblBorderWidth + "px solid " + tblBorderColor + ";" + borderTop + lastCellBorder + "' >" + cellsWithBr + 
                            "<br value='tblBreak'></td>" + delimCell;
                        } else {
                            htmlTbl += "<td name='tData' " + colVAlign + " style='" + printViewTblTDStyles + cellStyles + lastCellBorder + " border-left:" + tblBorderWidth + "px solid " + tblBorderColor + ";" + borderTop + "' >" + tds[i] + "" + "<br value='tblBreak'></td>" + delimCell
                        }
                    }
                    var bracketAndcomma = "\"]],\"tblId\":\"1\",\"tblClass\":\"data-tables\"}";
                    htmlTbl += "<td name='bracketAndcomma' class='  hide-el overhead' style='display:none;'>" + bracketAndcomma + "</td>";
                    htmlTbl += "</tr>";
                }
                htmlTbl += "</tbody></table>";
                return htmlTbl;
            },
            getCellAttrs: function (singleRowAttr, cellAttr, colAttr, authors, cell, row) {
                var attrsJSO = {};
                var colWidth = typeof (colAttr) == 'undefined' || colAttr == null ? "" : colAttr.width || "";
                attrsJSO['width'] = colWidth + 'px';
                var cellBgColor = "";
                //row highlight
                if (typeof (singleRowAttr) != 'undefined' && singleRowAttr != null) {
                    var bgColor = singleRowAttr.bgColor;
                    if (typeof (bgColor) != 'undefined' && bgColor != null && bgColor != '#FFFFFF') {
                        cellBgColor = bgColor;
                    }
                }
                //col highlight
                if (typeof (colAttr) != 'undefined' && colAttr != null) {
                    var bgColor = colAttr.bgColor;
                    if (typeof (bgColor) != 'undefined' && bgColor != null && bgColor != '#FFFFFF') {
                        cellBgColor = bgColor;
                    }
                }
                cellBgColor = typeof (cellAttr) == 'undefined' || cellAttr == null ? cellBgColor : cellAttr.bgColor || cellBgColor;
                attrsJSO['background-color'] = cellBgColor;
                var cellHeight = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.height || "";
                attrsJSO['height'] = cellHeight + 'px';
                var cellVAlign = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.vAlign || "";
                attrsJSO['vertical-align'] = cellVAlign;
                var cellHAlign = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.hAlign || "";
                attrsJSO['text-align'] = cellHAlign;
                var cellFont = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.fontFamily || "";
                attrsJSO['font-family'] = cellFont;
                var cellFontSize = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.fontSize || "";
                attrsJSO['font-size'] = cellFontSize + 'px';
                var cellFontWeight = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.fontWeight) == 'undefined'? "" : cellAttr.fontWeight || "";
                attrsJSO['font-weight'] = cellFontWeight;
                var cellFontStyle = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.fontStyle) == 'undefined'? "" : cellAttr.fontStyle || "";
                attrsJSO['font-style'] = cellFontStyle;
                var cellTextDecoration = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.textDecoration) == 'undefined'? "" : cellAttr.textDecoration || "";
                attrsJSO['text-decoration'] = cellTextDecoration;
                var attrsString = "";
                for (var attrName in attrsJSO) {
                    if (attrName && attrsJSO[attrName] != "" && attrsJSO[attrName] != "NaNpx" && attrsJSO[attrName] != "px") attrsString += attrName + ":" + attrsJSO[attrName] + " !important;";
                }
                return attrsString;
            },
            htmlspecialchars_decode: function (string) {
              string = string.toString()
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#0*39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');

              return string;
            },
            setLinks: function (data) {
              data = data.replace(/(https?:\/\/[^\s]+)/ig, "<a href='\$1' target='blank'>\$1</a>");
              return data;
            },
            getHtml: function (code, attributes) {
                var JSONCode = "";
                var html = "";
                try {
                    JSONCode = JSON.parse(code);
                    html = this.buildTabularData(JSONCode, attributes);
                } catch (error) {}
                return html;
            },
        };
        return dRenderer;
    }(); // end of anonymous function
// CommonJS
typeof (exports) != 'undefined' ? exports.DatatablesRenderer = DatatablesRenderer : null;
