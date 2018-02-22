// Modified: https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
export function userParam( name, url=undefined ) {
    if (url === undefined) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}