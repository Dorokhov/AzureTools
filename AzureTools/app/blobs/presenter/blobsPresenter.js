exports.create = function () {
    'use strict';

    return new function() {
        var self = this;

        self.oTable = null;
        self.Keys = null;
        
        self.cleanUp = function() {
            if (self.oTable) {
                self.oTable.destroy(false);
            }

        };

        var calcDataTableHeight = function() {
            console.log('dsf ' + $('#errorNotification').is(":visible"));
            var headerHeight = $('nav[role="navigation"]').height() + 50 + 52 + 20 + 5;
            return ($(window).height() - headerHeight);
        };

        self.showContainers = function(data, onSelect, removeCallback) {
            self.cleanUp();
            $('#containers').empty();

            $(window).unbind('resize');
            $(window).bind('resize', function() {
                $('.dataTables_scrollBody').css('height', calcDataTableHeight());
                self.oTable.columns.adjust().draw();
            });
            console.log('CONTAINERS');
            console.log(data);
            self.oTable = $('#containers').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                scrollX: true,
                data: data,
                autoWidth: true,
                columns: [
                    {
                        "title": "Table",
                        "data": "name"
                    },
                    {
                        "title": "",
                        "render": function() {
                            return '<a class="remove" style="color:black; cursor:pointer;" placeholder="Delete"><span class="icon-remove"></span></a>';
                        },
                    },
                ]
            });

            function format(type, value) {
                return '<div>' +
                    '<textarea class="details-textarea">' + value + '</textarea>' +
                    '<button type="button" class="btn btn-default updateButton">Update</button>' +
                    '</div>';
            }

            // open/close details
            $('#containers tbody').off('click', 'tr.even,tr.odd');
            $('#containers tbody').on('click', 'tr.even,tr.odd', function () {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);
                onSelect(row.data());
            });

            // handle update
            $('#containers tbody').off('click', 'button.btn.btn-default.updateButton');
            $('#containers tbody').on('click', 'button.btn.btn-default.updateButton', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var newValue = $(currentRow).find('textarea').val();
                var row = self.oTable.row(tr);
                updateCallback(row.data(), newValue);
            });

            // handle remove 
            $('#containers tbody').off('click', 'a.remove');
            $('#containers tbody').on('click', 'a.remove', function (event) {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);
                removeCallback(row.data());
                return false;
            });
        };

        self.showBlobs = function (data, onSelect, onImageViewSelect, onTextViewSelect) {
            if (data == null || (Object.prototype.toString.call(data) === '[object Array]' && data.length === 0)) {
                $('#blobs').empty();
                 return;
            }
            self.cleanUp();
            $('#blobs').empty();

            $(window).unbind('resize');
            $(window).bind('resize', function() {
                $('.dataTables_scrollBody').css('height', calcDataTableHeight());
                self.oTable.columns.adjust().draw();
            });

            var columnsDictionary = {};
            for (var i = 0; i < data.length; i++) {
                for (var propertyName in data[i]) {
                    if (columnsDictionary[propertyName] == undefined) {
                        columnsDictionary[propertyName] = propertyName;
                    }
                }
            }

            var columns = [];
            for (var col in columnsDictionary) {
                columns.push({
                    title: col,
                    data: col,
                    render: function(item) {
                        return '<span style="display: block;overflow: hidden;white-space:nowrap;">' + (item == undefined ? '' : item) + '</span>';
                    },
                });
            }

            self.oTable = $('#blobs').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                scrollX: true,
                data: data,
                autoWidth: false,
                columns: [
                    {
                        "title": "Blob Name",
                        "data": "name"
                    }
                ]
            });

            // open/close details
            function format(type, value) {
                return '<div>' +
                    //'<textarea class="details-textarea">' + value + '</textarea>' +
                    '<button type="button" class="btn btn-default left image">Image</button>' +
                    '<button type="button" class="btn btn-default left text">Text</button>' +
                    '</div>';
            }

            $('#blobs tbody').off('click', 'tr.even,tr.odd');
            $('#blobs tbody').on('click', 'tr.even,tr.odd', function () {
                var tr = $(this).closest('tr');
                var row = self.oTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    // Open this row
                    row.child(format(row.data().Type, row.data().Value)).show();
                    var detailsTr = tr.next();

                    // fit text area to content
                    //var textarea = detailsTr.find("textarea");
                    //textarea.height((textarea.prop("scrollHeight")));

                    detailsTr.addClass('shown');
                    tr.addClass('shown');
                }
            });

            // handle image click
            $('#blobs tbody').off('click', 'button.btn.btn-default.left.image');
            $('#blobs tbody').on('click', 'button.btn.btn-default.left.image', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var row = self.oTable.row(tr);
                onImageViewSelect(row.data(), function (imageAsBase64) {
                    row.child('<img src="data:image/png;base64,' + imageAsBase64 + '"/>');
                });
            });

            // handle text click
            $('#blobs tbody').off('click', 'button.btn.btn-default.left.text');
            $('#blobs tbody').on('click', 'button.btn.btn-default.left.text', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var row = self.oTable.row(tr);
                onTextViewSelect(row.data(), function (text) {
                    row.child('<textarea class="details-textarea">' + text + '</textarea>');
                });
            });
        };
    };
}