var util=require('util');

exports.getUserInsertQuery = function(username,pass,name,lastName,city,country,email){
    return util.format("INSERT INTO [dbo].[User] VALUES ('%s','%s','%s','%s','%s','%s','%s');"
    ,username,pass,name,lastName,city,country,email);
}

exports.getUserQuestionInsertQuery = function(username,questions,answers){
    return util.format("INSERT INTO UserRetrival VALUES ('%s','%s','%s','%s','%s');"
    ,username,questions[0],questions[1],answers[0],answers[1]);
}

exports.getUserCategoryInsertQuery = function(username,categories, i){
    return util.format("INSERT INTO UserCategory VALUES ('%s','%s');",username,categories[i]);
}

exports.getUserQuery = function(username){
    return util.format("SELECT username, password FROM [dbo].[User] WHERE username='%s';",username);
}

exports.getUserQuestionAnswerQuery = function(username){
    return util.format("SELECT * FROM [dbo].[UserRetrival] WHERE username='%s';",username);
}
