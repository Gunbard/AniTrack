/**
 AniTrack
 Serverless, cross platform Chinese Girl Cartoon Tracking System
 Runs on most modern browsers, including mobile browsers.
 @author Gunbard
 License: MIT
 */
 
var saveData;
var tableData;

// Check for File API support
if (!window.File || !window.FileReader || !window.Blob) 
{
    var errorText = 'The File APIs are not fully supported in this browser.\n' +
                    'You will not be able to import/export data.';
    alert(errorText);
}


// Ready
$(function ()
{   
    /****************
     MAIN
    *****************/

    $('#exportButton').click(function ()
    {
        generateTextFileDownload('save.dat', saveData);
    });
    
    $('#importButton').click(function ()
    {
        $('#hiddenFileInput').click();
    });
    
    $('#progressBar').progressbar
    ({
        value: true
    });
    
    $('#getButton').click(function ()
    {
        var username = $('#inputUsername').val();
        if (username.length == 0)
        {
            return;
        }
     
        // SPIN TO WIN
        $('#progressBar').progressbar
        ({
            value: false
        });
        
        
        getEntriesForCategory(username, CATEGORY_TYPE.all, function (entries)
        {
            $('#container').jtable({});
            $('#container').jtable('destroy');
            
            // Format data for use by jTable
            tableData = 
            {
                'Result': 'OK',
                'Records': entries
            };
            
            $('#container').jtable
            ({
                title: 'Chinese Girl Cartoons',
                sorting: true,
                defaultSorting: 'title ASC',
                actions: 
                {
                    listAction: function (postData, jtParams)
                    {
                        // Sort table based on sorting command
                        var sortingCommand = jtParams.jtSorting.split(' ');
                        
                        var fieldToSort = sortingCommand[0];
                        var direction = (sortingCommand[1] == 'ASC');
                        
                        var unsortedData = tableData.Records;
                        var sortedData = sortByKey(unsortedData, fieldToSort, direction);
                        tableData.Records = sortedData;
                        
                        return tableData;
                    }
                },
                fields: 
                {
                    id: 
                    {
                        key: true,
                        list: false
                    },
                    url:
                    {
                        list: false
                    },
                    title:
                    {
                        title: 'Title',
                        width: '60%',
                        display: function (data)
                        {
                            return '<a target="_blank" href="' + 
                                   DATA_SOURCE_ROOT + data.record.url + '">' + 
                                   data.record.title + 
                                   '</a>';
                        }
                    },
                    rating: 
                    {
                        title: 'Rating',
                        width: '5%',
                        display: function (data)
                        {
                            if (data.record.rating > -1)
                            {
                                return RATINGS_DISPLAY_TEXT[data.record.rating]; 
                            }
                            
                            return '--';
                        }
                    },
                    category:
                    {
                        title: 'Category',
                        width: '5%',
                        display: function (data)
                        {
                            switch (parseInt(data.record.category))
                            {
                                case CATEGORY_TYPE.wantToSee:
                                    return 'Want to See';
                                    break;
                                case CATEGORY_TYPE.seenSome:
                                    return 'Seen Some';
                                    break;
                                case CATEGORY_TYPE.seenAll:
                                    return 'Seen All';
                                    break;
                                default:
                                    return '--'
                            }
                        }
                    },
                    eps:
                    {
                        title: 'Ep. Length',
                        width: '5%'
                    },
                    comment:
                    {
                        title: 'Comment',
                        width: '20%'
                    },
                    getData:
                    {
                        sorting: false,
                        columnResizable: false,
                        width: '5%',
                        display: function (data)
                        {
                            return '<input type="button" value="Get Data" onClick="getAdditionalData(tableData.Records[' + tableData.Records.indexOf(data.record) + '])">'
                        }
                    }
                },
                toolbar: 
                {
                    items: 
                    [{
                        text: 'Export to CSV',
                        click: function () 
                        {
                            // Generate a basic csv file. Add option to remove columns later.
                            var csvData = 'Title, Rating\n';
                            var tableEntries = tableData.Records;
                            
                            for (var i = 0; i < tableEntries.length; i++)
                            {
                                var entry = tableEntries[i];
                                csvData += '"' + entry.title + '",' 
                                        
                                if (entry.rating > -1)
                                {
                                    csvData += RATINGS_DISPLAY_TEXT[entry.rating];
                                }
                                else
                                {
                                    csvData += ',';
                                }
                                
                                csvData += '\n';                               
                            }
                            
                            generateTextFileDownload('animu.csv', csvData);
                        }
                    }]
                }
            });
            
            $('#container').jtable('load');
            
            $('#progressBar').progressbar
            ({
                value: true
            });
        });
    });
});