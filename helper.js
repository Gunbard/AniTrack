/**
 Reusable helper methods
 */

/**
 Uses Yahoo yql as a proxy to get cross site data so we don't have to run
 this on a server
 @param url [string] The url to get
 @param callback [function] A callback function (optional)
 @returns A JSON object of the obtained data
 */
function crossSiteGet(url, callback)
{
    var q = encodeURIComponent('select * from html where url="' + url + '"');
    $.ajax
    ({
        type: 'get',
        url: 'http://query.yahooapis.com/v1/public/yql?format=json&q=' + q,
        dataType: 'html',
        success: function (data) 
        {
            if (data && callback && typeof callback === 'function')
            {
                data = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                jsonData = JSON.parse(data);
                callback(jsonData);
            }
        }     
    });
}

/**
 Generates text file to download
 @param filename [string] Name of the file
 @param text [string] The file's text data
 */
function generateTextFileDownload(filename, text) 
{
    var blob = new Blob([text], {ype: 'text/plain'});
    var textUrl = URL.createObjectURL(blob);
    
    var $tempAnchor = $('<a>').attr
    (
        {
            href: textUrl,
            download: filename,
            style: 'display:none;'
        }
    );
    
    $tempAnchor.click(function ()
    {
        $(this).remove();
    });
    
    $tempAnchor.appendTo($('body'));
    $tempAnchor[0].click();
}

/**
 Digs through an object for a specific key
 @param data [object] The object to search through
 @param searchKey [string] The key to search for
 @param callback [function] Called when finished with found value as first param
 */
function valueByKey(data, searchKey, callback)
{
    var foundValue;
    
    if (data && typeof data === 'object') 
    {
        $.each(data, function (key, val) 
        {
            if (key == searchKey)
            {
                foundValue = val;
                return false;
            }

            valueByKey(val, searchKey, callback);
        });
    }
    
    if (foundValue)
    {
        callback(foundValue);
    }
}

/**
 Sorts an array by key
 @param arrayToSort [array] The array to be sorted
 @param keyName [string] Name of the key to sort byte
 @param ascend [bool] True if sort should be ascending,
                      false if it should be descending
 @returns The sorted array
 */
function sortByKey(arrayToSort, keyName, ascend)
{
    return arrayToSort.sort(function (a, b)
    {
        if (ascend)
        {
            return a[keyName].localeCompare(b[keyName]);
        }
        else
        {
            return b[keyName].localeCompare(a[keyName]);
        }
    });
}
