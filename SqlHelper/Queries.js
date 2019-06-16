var util=require('util');

exports.getUserInsertQuery = function(username,pass,name,lastName,city,country,email){
    return util.format("INSERT INTO [dbo].[User] VALUES ('%s','%s','%s','%s','%s','%s','%s');"
    ,username,pass,name,lastName,city,country,email);
}

exports.getUserQuestionInsertQuery = function(username,questions,answers,i){
    return util.format("INSERT INTO UserRetrival VALUES ('%s','%s','%s');"
    ,username,questions[i],answers[i]);
}

exports.getUserCategoryInsertQuery = function(username,categories, i){
    return util.format("INSERT INTO UserCategory VALUES ('%s','%s');",username,categories[i]);
}

exports.getUserCategoryQuery = function(username){
    return util.format("SELECT category FROM UserCategory WHERE username='%s';",username);
}


exports.getUserQuery = function(username){
    return util.format("SELECT * FROM [dbo].[User] WHERE username='%s';",username);
}

exports.getUserAnswerQuery = function(username){
    return util.format("SELECT * FROM [dbo].[UserRetrival] WHERE username='%s';",username);
}

exports.getSavedPointInsertQuery = function(username, pointID, date, order){
    return util.format("INSERT INTO SavedPOI VALUES ('%s','%s','%s','%s');",username,pointID,date,order);
}


exports.getSavedPointQuery = function(username, numOfPoints){
    return util.format("SELECT TOP %s POI.id, dateSaved, sortingOrder, name, image_path, category FROM SavedPOI AS sp JOIN POI ON sp.pointID = POI.id  WHERE username='%s';",numOfPoints,username);
}

exports.getUserQuestionQuery = function(username){
    return util.format("SELECT uq.question FROM [dbo].[UserRetrival] AS ur JOIN [dbo].[UserQuestion] AS uq ON ur.question = uq.id WHERE username='%s';",username);
}

exports.getAllQuestionQuery = function (){
    return util.format("SELECT * FROM [dbo].[UserQuestion];");
}

exports.getAllCategoriesQuery = function (){
    return util.format("Select * FROM [dbo].[Category];");
}

exports.getSavedPointDeleteQuery = function(username, pointID){
    return util.format("DELETE from SavedPOI WHERE username='%s' AND pointID=%s;",username,pointID);
}

exports.getSavedPointUpdateQuery = function(username, order){
    var query = "UPDATE [dbo].[SavedPOI] SET sortingOrder = CASE pointID";
    order.forEach(element => {
        query += " WHEN " + element['pointID'] + "THEN " + element['sortingOrder']  
    });

    query += " ELSE sortingOrder END WHERE username='%s';"
    return util.format(query,username);
}

exports.getAllPointsQuery = function(){
    return util.format("SELECT * FROM [dbo].[POI];");
}

exports.getPopularPointsQuery = function(rank){
    return util.format("SELECT POI.id,name,image_path,category FROM POI JOIN (SELECT pointID, AVG(CAST([rank] AS FLOAT)) as rating FROM POI_Review GROUP BY pointID) as reviewT ON reviewT.pointID = POI.id WHERE rating >= %s;",rank)
}

exports.getPointInfoQuery = function(pointID){
    return util.format("UPDATE POI_Info SET views = views + 1 WHERE id = '%s'; SELECT POI.id, [name], image_path, category, [views], [description], rating FROM ((POI JOIN POI_Info AS info ON POI.id = info.id) JOIN (SELECT pointID, AVG(CAST([rank] AS FLOAT)) as rating FROM POI_Review GROUP BY pointID) as reviewT ON POI.id = reviewT.pointID) WHERE POI.id = %s;",pointID,pointID)
}

exports.getPointReviewQuery = function(pointID){
    return util.format("SELECT * FROM POI_Review WHERE pointID = %s AND review != 'null';",pointID);
}

exports.getPointsByCategoryQuery = function (categories, numOfPoints){
    return util.format("SELECT TOP %s * FROM POI WHERE category IN %s",numOfPoints,categories);
}

exports.getUserRankPointInsertQuery = function (pointID, username, date, rank, comment){
    return util.format("INSERT INTO POI_Review VALUES ('%s','%s','%s','%s','%s');",pointID, username, date, rank, comment);
}

exports.getUserRankPointQuery = function (pointID, username){
    return util.format("SELECT * FROM POI_Review WHERE pointID = %s AND username = '%s';",pointID, username);
}

exports.getUserRankPointUpdateQuery = function (pointID, username, date, rank, comment){
    return util.format("UPDATE POI_Review SET rank = %s, date = '%s', review= '%s' WHERE pointID = %s AND username = '%s';",rank, date, comment, pointID, username);
}



