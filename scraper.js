/**
 Methods used for scraping encyclopedia data
 */

/**
 Gets an object list of all entries for a category
 @param username {string} The username to query
 @param category {CATEGORY_TYPE} The category to query
 @param callback Called when finished with first param entries {array}
 
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
        'eps':              int
        'thumbnail':        url string
        
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
    
    crossSiteGet('http://www.animenewsnetwork.com/MyAnime/?user=' + username + '&categ=' + category, 'html', function (data) 
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
                    
                    // Default to blank so it can still be sorted
                    var title = entryContainer && entryContainer.a ? 
                                entryContainer.a.font.content : '';
                    var url = entryContainer && entryContainer.a ? 
                              entryContainer.a.href : '';
                    var rating = currentEntry[1] && currentEntry[1].p ? 
                                 currentEntry[1].p : '';
                    var comment = currentEntry[2] ? 
                                  currentEntry[2].small : '';
                    
                    // Convert rating to a number so we can do calculations and stuff
                    rating = RATINGS_TYPE[rating];

                    // Get other id
                    var annId = url.match(/id=(\d+)/)[1];
                    
                    // Format data
                    var newEntry = 
                    {
                        'id':           i,
                        'annId':        annId,
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

/**
 Gets entries from a user and appends new ones to current list
 @param username {string} The username to query
 @param category {CATEGORY_TYPE} The category to query
 @param callback Called when finished with first param new entries {array}
 */
function appendEntriesFromUser(currentEntries, username, category, callback)
{
    getEntriesForCategory(username, category, function (entries)
    {
        var newEntries = [];
        
        for (var i = 0; i < entries.length; i++)
        {
            var found = false;
            for (var j = 0; j < currentEntries.length; j++)
            {
                if (entries[i].title && entries[i].title == currentEntries[j].title)
                {
                    found = true;
                    break;
                }
            }
            
            if (!found)
            {
                newEntries.push(entries[i]);
            }
        }
        
        callback(newEntries);
    });
}

/**
 Obtains additional encyclopedia data for a title
 @param entry {ENTRY_MODEL} The entry to look up
 */
function getAdditionalData(entry)
{
    var entryId = entry.annId;
    crossSiteGet('http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=' + entryId, 'xml', function (data)
    {
        var infoData = data.query.results.ann.anime.info;
        
        var info = {};
        for (var i = 0; i < infoData.length; i++)
        {
            if (infoData[i].type && infoData[i].type.length > 0)
            {
                var type = infoData[i].type;
                
                // Initialize array if not defined
                if (!info[type])
                {
                    info[type] = [];
                }
                
                var contentData;
                
                if (infoData[i].content)
                {
                    contentData = infoData[i].content;
                }
                else if (infoData[i].img)
                {
                    var imageData = infoData[i]['img'];
                    if (typeof imageData == 'array')
                    {
                        contentData = imageData[0];
                    }
                    else
                    {
                        contentData = imageData;
                    }
                }
                
                info[type].push(contentData);
            }
        }
        
        // Save response for now
        entry['titleData'] = info;
        
        entry['eps'] = (info['Number of episodes']) ? info['Number of episodes'][0] : 1;
        entry['summary'] = (info['Plot Summary']) ? info['Plot Summary'] : '';
        entry['genres'] = (info['Genres']) ? info['Genres'] : '';

        if (info['Picture']) 
        {
            if (info['Picture'][0].length > 1)
            {
                entry['thumbnail'] = info['Picture'][0][0]['src'];
            }
            else
            {
                entry['thumbnail'] = info['Picture'][0]['src'];   
            }
        }
        
        saveData();
        
        $('#tableContainer').jtable('reload');
    });
}
