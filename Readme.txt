========== Update Package ==========
npm install

========== Update Models ==========
sequelize-auto -o "./models" -d blog -h 127.0.0.1 -u root -p 3306 -x  -e mysql -t tbl_article

========== Start Project ==========
node server

========== Postman collections ==========
https://www.getpostman.com/collections/334486c097a540084998


Notes
1) set you my sql credentials .env file
2) how to run Project

=> 1) cd API_BLOG
   2) npm install
   3) node server



3) api list

=> 1) GetAllArticleWithDynamicPaging (GET)
     
     query params 
     1) page 
     2) limit 
     3) search (not compulsory)

     example: http://127.0.0.1:20014/blog/GetAllArticleWithDynamicPaging?page=1&limit=20
    
    2) GetArticleById (GET)

    query params 
    id

    example:http://127.0.0.1:20014/blog/GetArticleById?id=1


    3) SaveArticle (POST)
     
     post params
     id
     nick_name
     title
     content


     example : http://127.0.0.1:20014/blog/SaveArticle

     post_json : 
     {
    "id": 0,
    "nick_name": "jayeshbhanderi",
    "title": "Where does it come from?",
    "content": "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "
     }
      

    3) UpdateArticle (POST)
     
     post params
     id
     nick_name
     title
     content


     example : http://127.0.0.1:20014/blog/SaveArticle

     post_json : 
     {
      "id": 2,
    "nick_name":"jayeshbhanderi",
    "title": "Why do we use it?",
    "content": "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
     }


    4) GetAllCommentByArticleId (GET)

      query params 
        article_id


        example:http://127.0.0.1:20014/blog/GetAllCommentByArticleId?article_id=1

    5)  CommentArticle (Post)

        post params
        article_id
        nick_name
        content

        example:http://127.0.0.1:20014/blog/CommentArticle
         
         post_json:
          {
            "nick_name": "jayeshbhanderi",
            "content": "Where does it come from?",
            "article_id": "1"
          }   

    6)  ReplayToCommentArticle (Post)

        post params
        article_id
        article_comment_id
        nick_name
        content

        example:http://127.0.0.1:20014/blog/ReplayToCommentArticle
         
         post_json:
         {
            "nick_name": "jayeshbhanderi",
            "content": "Where does it come from?",
            "article_id": "1",
            "article_comment_id":"4"
        }

    


      
