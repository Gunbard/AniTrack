/**
 AniTrack
 Serverless, cross platform Chinese Girl Cartoon Tracking System
 Runs on most modern browsers, including mobile browsers.
 @author Gunbard
 License: MIT
 */
 
var sortingDirection = 'ASC';
 
var tableData = 
{
    'Result': 'OK',
    'Records': []
};

// Check for File API support
if (!window.File || !window.FileReader || !window.Blob) 
{
    var errorText = 'The File APIs are not fully supported in this browser.\n' +
                    'You will not be able to import/export data.';
    alert(errorText);
}

// Check for localStorage support
try 
{
    'localStorage' in window && window['localStorage'] !== null;
} 
catch (e) 
{
    var errorText = 'HTML5 localStorage is not supported in this browser.\n' +
                    'Your data will not automatically save.';
    alert(errorText);
}

/**
 Saves data to localStorage
 */
function saveData()
{
    localStorage.setItem('savedTableData', JSON.stringify(tableData));
    console.log('[INFO] Save OK');
}

/**
 Retrieves data from localStorage
 */
function loadData()
{
    var saveData = localStorage.savedTableData;
    if (saveData)
    {
        tableData = JSON.parse(saveData);
        console.log('[INFO] Load OK');
    }
}

/**
 Attaches a lazy loading mechanism to all images
 */
function applyLazyload()
{
    $('img.lazy').lazyload
    ({
        effect: 'fadeIn',
        failure_limit: 10
    });
}

/**
 Initializes the jTable
 */
function buildTable()
{
    $('#tableContainer').jtable({});
    $('#tableContainer').jtable('destroy');

    $('#tableContainer').jtable
    ({
        title: 'Chinese Girl Cartoons',
        sorting: true,
        paging: true,
        defaultSorting: 'title ASC',
        actions: 
        {
            listAction: function (postData, jtParams)
            {
                // Sort table based on sorting command
                var sortingCommand = jtParams.jtSorting.split(' ');
                
                var fieldToSort = sortingCommand[0];
                var direction = (sortingCommand[1] == 'ASC');
                
                var sortingChanged = (sortingDirection == sortingCommand[1]);
                sortingDirection = sortingCommand[1];
                
                var unsortedData = tableData.Records;
                
                // Sorting is rather expensive so only do it if
                // the sorting direction actually changed
                var sortedData = (sortingChanged) ? sortByKey(unsortedData, fieldToSort, direction) : unsortedData;
                
                tableData.Records = sortedData;
                
                var pagedData = 
                {
                    'Result': 'OK',
                    'Records': tableData.Records.slice(jtParams.jtStartIndex, parseInt(jtParams.jtStartIndex, 10) + parseInt(jtParams.jtPageSize, 10)),
                    'TotalRecordCount': sortedData.length
                };
                
                return pagedData;
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
            thumbnail:
            {
                sorting: false,
                width: '10%',
                display: function (data)
                {
                    if (data.record.thumbnail) 
                    {
                        return '<img class="thumbnail lazy" data-original="' + data.record.thumbnail + '" height="150px" />';
                    }
                    else
                    {
                        return '<div class="thumbnail-holder"></div>';
                    }
                }
            },
            title:
            {
                title: 'Title',
                width: '30%',
                display: function (data)
                {
                    return '<span class="table-item"><a target="_blank" href="' + 
                           DATA_SOURCE_ROOT + data.record.url + '">' + 
                           data.record.title + 
                           '</a></span>';
                }
            },
            summary: 
            {
                title: 'Summary',
                sorting: false,
                width: '15%',
                display: function (data)
                {
                    var displayText = (data.record.summary) ? data.record.summary : '';
                    return '<div class="long-text"><span class="table-comment">' + displayText + '</span></div>';
                }
            },
            genres:
            {
                title: 'Genres',
                sorting: false,
                width: '10%',
                display: function (data)
                {
                    var displayText = '';
                    if (data.record.genres)
                    {
                        for (var i = 0; i < data.record.genres.length; i++)
                        {
                            displayText += data.record.genres[i];
                            if (i < data.record.genres.length - 1)
                            {
                                displayText += ', ';
                            }
                        }
                    }
                    
                    return '<div class="long-text"><span class="table-comment">' + displayText + '</span></div>';
                }
            },
            rating: 
            {
                title: 'Rating',
                width: '5%',
                display: function (data)
                {
                    var displayText = (data.record.rating > -1) ? 
                                      RATINGS_DISPLAY_TEXT[data.record.rating] : '';

                    return '<span class="table-item">' + displayText + '</span>'; 
                }
            },
            category:
            {
                title: 'Category',
                width: '5%',
                display: function (data)
                {
                    var displayText;
                    switch (parseInt(data.record.category))
                    {
                        case CATEGORY_TYPE.wantToSee:
                            displayText = 'Want to See';
                            break;
                        case CATEGORY_TYPE.seenSome:
                            displayText = 'Seen Some';
                            break;
                        case CATEGORY_TYPE.seenAll:
                            displayText = 'Seen All';
                            break;
                        default:
                            displayText = ''
                    }
                    
                    return '<span class="table-item">' + displayText + '</span>'; 

                }
            },
            eps:
            {
                title: 'Length',
                width: '5%',
                display: function (data)
                {
                    var displayText = (data.record.eps) ? data.record.eps : '';
                    return '<span class="table-item">' + displayText + '</span>';
                }
            },
            comment:
            {
                title: 'Comment',
                width: '20%',
                display: function (data)
                {
                    return '<div class="long-text">' + data.record.comment + '</div>';
                }
            },
            getData:
            {
                sorting: false,
                columnResizable: false,
                width: '5%',
                display: function (data)
                {
                    return '<input type="button" value="Get Data" onClick="getAdditionalData(tableData.Records[' + tableData.Records.indexOf(data.record) + '])">';
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
        },
        recordsLoaded: function (event, data)
        {
            // Re-bind lazy load to images
            applyLazyload();
        }
    });
}

// Ready
$(function ()
{   
    /****************
     MAIN
    *****************/

    $('#exportButton').click(function ()
    {
        var saveData = JSON.stringify(tableData);
        generateTextFileDownload('save.dat', saveData);
    });
    
    $('#importButton').click(function ()
    {
        $('#hiddenFileInput').click();
    });
    
    $('#hiddenFileInput').change(function () 
    {
        var selectedFile = $('#hiddenFileInput').get(0).files[0];
        var reader = new FileReader();
        reader.onload = function ()
        {
            tableData = JSON.parse(this.result);
            $('#tableContainer').jtable('reload', function ()
            {
                saveData();
            });
        };
        
        reader.readAsText(selectedFile);
    })
    
    $('#progressBar').progressbar
    ({
        value: true
    });
    
    // Attempt to load locally saved data
    loadData();
    
    buildTable();
    
    $('#tableContainer').jtable('reload');
    
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
            // Format data for use by jTable
            tableData = 
            {
                'Result': 'OK',
                'Records': entries
            };
                        
            $('#tableContainer').jtable('reload');
            
            $('#progressBar').progressbar
            ({
                value: true
            });
        });
        
    });
    
    $('#appendButton').click(function ()
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
    
        appendEntriesFromUser(tableData.Records, username, CATEGORY_TYPE.all, function (newEntries)
        {
            var displayText = 'Got ' + newEntries.length + ' new title(s)\n';
            for (var i = 0; i < newEntries.length; i++)
            {
                displayText += newEntries[i].title + '\n';
            }
            
            alert(displayText);
            
            if (newEntries.length == 0)
            {
                return;
            }
            
            // Add new entries
            tableData.Records = tableData.Records.concat(newEntries);
            
            $('#tableContainer').jtable('reload');
            
            $('#progressBar').progressbar
            ({
                value: true
            });
        });
    });
});
