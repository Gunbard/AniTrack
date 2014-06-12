/**
 AniTrack
 Serverless, cross platform Chinese Girl Cartoon Tracking System
 Runs on most modern browsers, including mobile browsers.
 Author: Gunbard
 License: MIT
 */
 
var saveData;

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
            var tableData = 
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
                        var sortingCommand = jtParams.jtSorting.split(' ');
                        
                        // Need to override title since it has an anchor link in it
                        var fieldToSort = (sortingCommand[0] == 'title') ? 'textTitle' : sortingCommand[0];
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
                    textTitle:
                    {
                        list: false
                    },
                    title:
                    {
                        title: 'Title',
                        width: '80%'
                    },
                    rating: 
                    {
                        title: 'Rating',
                        width: '20%'
                    },
                    category:
                    {
                        title: 'Category'
                    }
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