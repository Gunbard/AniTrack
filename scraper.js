/**
 Methods used for scraping encyclopedia data
 */

/**
 Gets an object list of all entries for a category
 @param username [string] The username to query
 @param category [CATEGORY_TYPE] The category to query
 @param callback Called when finished with first param entries [array]
 
    ENTRY_MODEL
    {
        'title':            string
        'url':              string
        'rating':           string
        'comment':          string
        'category':         CATEGORY_TYPE
        
        REQ. ADDTL PARSING:
        'userRatings':      ???
        'genres':           array [string]
        'op':               string
        'ed':               string
        'vintage':          string
        'epLength':         int
        
        USER ADDED:
        'dateStarted':      date
        'dateFinished':     date
        'currentEp':        length
        
    }
 */
function getEntriesForCategory(username, category, callback)
{
    var retrievedEntries = [];
    
    username = encodeURIComponent(username);
    
    crossSiteGet('http://www.animenewsnetwork.com/MyAnime/?user=' + username + '&categ=' + category, function (data) 
    {
        valueByKey(data, 'table', function (tableElement)
        {
            valueByKey(tableElement, 'tr', function (dataEntries)
            {
                for (var i = 0; i < dataEntries.length; i++)
                {
                    var category = 0;
                    var dataId = dataEntries[i].id;
                    if (dataId)
                    {
                        var splitId = dataId.split('-')[0];
                        category = splitId.match(/\d+$/)[0];
                    }
                    else
                    {
                        continue;
                    }
                    
                    var currentEntry = dataEntries[i].td;
                    var entryContainer = currentEntry[0] ? currentEntry[0].strong : currentEntry.strong;
                    if (!entryContainer || entryContainer.length == 0)
                    {
                        continue;
                    }
                    var title = entryContainer && entryContainer.a ? 
                                entryContainer.a.font.content : '';
                    var url = entryContainer && entryContainer.a ? 
                              entryContainer.a.href : '';
                    var rating = currentEntry[1] && currentEntry[1].p ? 
                                 currentEntry[1].p : '--';
                    var comment = currentEntry[2] ? 
                                  currentEntry[2].small : '--';

                    // Format data
                    var newEntry = 
                    {
                        'id':           i,
                        'title':        title.trim(),
                        'url':          url,
                        'rating':       rating,
                        'comment':      comment,
                        'category':     category
                    };
                    
                    if (newEntry.title.length > 0 && newEntry.url.length > 0)
                    {
                        retrievedEntries.push(newEntry);
                    }
                }
            });
        });
        
        callback(retrievedEntries);
    });
}