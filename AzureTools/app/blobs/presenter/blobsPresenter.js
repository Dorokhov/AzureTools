exports.create = function () {
    'use strict';

    return new function () {
        var self = this;

        self.containersTable = null;
        self.blobsTable = null;
        self.Keys = null;

        self.cleanUpContainers = function () {
            if (self.containersTable) {
                self.containersTable.destroy(false);
            }
        };

        self.cleanUpBlobs = function () {
            if (self.blobsTable) {
                self.blobsTable.destroy(false);
            }
        };

        var calcDataTableHeight = function () {
            var headerHeight = $('nav[role="navigation"]').height() + 50 + 52 + 20 + 5;
            return ($(window).height() - headerHeight);
        };

        self.showContainers = function (data, onSelect, removeCallback) {
            self.cleanUpContainers();
            $('#containers').empty();

            $(window).unbind('resize');
            $(window).bind('resize', function () {
                $('#containers_wrapper .dataTables_scrollBody').css('height', calcDataTableHeight());
                self.containersTable.columns.adjust().draw();
            });
            console.log('CONTAINERS');
            console.log(data);
            self.containersTable = $('#containers').DataTable({
                bFilter: false,
                bInfo: false,
                bPaginate: false,
                scrollY: calcDataTableHeight(),
                scrollX: true,
                data: data,
                autoWidth: true,
                columns: [
                    {
                        "title": "Container",
                        "data": "name"
                    }
                ]
            });

            // open/close details
            $('#containers tbody').off('click', 'tr.even,tr.odd');
            $('#containers tbody').on('click', 'tr.even,tr.odd', function () {console.log('SELECTED')
                var tr = $(this).closest('tr');
                var row = self.containersTable.row(tr);
                onSelect(row.data());
            });

            // handle remove 
            $('#containers tbody').off('click', 'a.remove');
            $('#containers tbody').on('click', 'a.remove', function (event) {
                var tr = $(this).closest('tr');
                var row = self.containersTable.row(tr);
                removeCallback(row.data());
                return false;
            });
        };

        self.showBlobs = function (data, onSelect, onImageViewSelect, onTextViewSelect, onDownloadSelect) {
            if (data == null || (Object.prototype.toString.call(data) === '[object Array]' && data.length === 0)) {
                $('#blobs').empty();
                return;
            }
            self.cleanUpBlobs();
            $('#blobs').empty();

            $(window).unbind('resize');
            $(window).bind('resize', function () {
                $('#blobs_wrapper .dataTables_scrollBody').css('height', calcDataTableHeight());
                self.blobsTable.columns.adjust().draw();
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
                    render: function (item) {
                        return '<span style="display: block;overflow: hidden;white-space:nowrap;">' + (item == undefined ? '' : item) + '</span>';
                    },
                });
            }

            $('#blobs .dataTables_scroll').css('margin-top', '-19px');

            self.blobsTable = $('#blobs').DataTable({
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
            function format(imageAsBase64, text) {

                return '<div>' +

                    '<button type="button" class="btn btn-default left image">Image</button>' +
                    '<button type="button" class="btn btn-default left text" style="margin-left:3px;">Text</button>' +
                    '<button type="button" class="btn btn-default left download" style="margin-left:3px;">Download</button>' +

                    (imageAsBase64 ? '<img src="data:image/png;base64,' + imageAsBase64 + '"/>' : '') +
                    (text ? '<textarea class="details-textarea">' + text + '</textarea>' : '') +

                    '</div>';
            }

            $('#blobs tbody').off('click', 'tr.even,tr.odd');
            $('#blobs tbody').on('click', 'tr.even,tr.odd', function () {
                var tr = $(this).closest('tr');
                var row = self.blobsTable.row(tr);

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
                var row = self.blobsTable.row(tr);
                onImageViewSelect(row.data(), function (imageAsBase64) {
                    row.child(format(imageAsBase64, null));
                });
            });

            // handle text click
            $('#blobs tbody').off('click', 'button.btn.btn-default.left.text');
            $('#blobs tbody').on('click', 'button.btn.btn-default.left.text', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var row = self.blobsTable.row(tr);
                onTextViewSelect(row.data(), function (text) {
                    row.child(format(null, text));
                });
            });


            // handle download click
            $('#blobs tbody').off('click', 'button.btn.btn-default.left.download');
            $('#blobs tbody').on('click', 'button.btn.btn-default.left.download', function () {
                var currentRow = $(this).closest('tr');
                var tr = currentRow.prev();
                var row = self.blobsTable.row(tr);

                var blob = row.data();
                onDownloadSelect(blob, function (bytes) {
                    chrome.fileSystem.chooseEntry({
                        type: 'saveFile',
                        suggestedName: blob.name
                    },
                        function (writableFileEntry) {
                            writableFileEntry.createWriter(function (writer) {
                                writer.onwriteend = function (e) {

                                };

                                writer.write(new Blob(bytes,
                                {
                                     type: 'text/plain'
                                })); 
                            }, function(e) { console.log(e); });
                        });
                });
            });
        };
    };
}