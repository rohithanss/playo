# playo

Delployed Link: https://playo.onrender.com/

## Dependencies

> "bcrypt": "^5.1.0",

> "cors": "^2.8.5",

> "cron": "^2.2.0",

> "dotenv": "^16.0.3",

> "express": "^4.18.2",

> "jsonwebtoken": "^9.0.0",

> "mongoose": "^7.0.1"

## Endpoints

- /user/register
- /user/login
- /events/
- /events/details/:eventId
- /events/joinevent/:eventId
- /events/canceljoinrequest/:eventId
- /events/mybookings
- /events/create
- /events/myevents
- /events/myevents/details/:eventId
- /events/myevents/acceptplayer/:eventId
- /events/myevents/rejectplayer/:eventId

### /user/register

- User with the same email can not register

> **headers.body***: `{name, email, password}`

> **return** (on successful registration) => 

        {status:"success", msg:"regisration successful"} 

### /user/login

> **headers.body***: `{email, password}`

> **return** (on successful Login) => 

        {status:"success", token:(JWT_Token)"} 
 

### /events/

> **headers.authorization*** : `Bearer ${token}`

> **return** (after token verification and request is successful)(sample output)  =>   

            {
            "_id": "640b57c82260d251931e36a4",
            "organizerId": "640b47357e84f00e9519f727",
            "eventName": "Punjab Cricket Tournament",
            "gameName": "Cricket",
            "venue": "Stadium, near Bus Stand",
            "city": "Malerkotla",
            "totalPlayersAllowed": 5,
            "acceptedPlayers": 0,
            "totalPlayersApplied": 8,
            "eventDate": "2023-03-16T14:00:00.000Z",
            "__v": 0
        }
        

### /events/details/:eventId

> **headers.authorization*** : `Bearer ${token}`

> **:eventId***: `in endpoint's params is the Id of event, user wants the info of the players who are joining the event`

> **return** (after token verification and request is successful)(sample output with players array(all players with request status *accepted* ))  =>   

            {
            "_id": "640b57c82260d251931e36a4",
            "organizerId": "640b47357e84f00e9519f727",
            "eventName": "Punjab Cricket Tournament",
            "gameName": "Cricket",
            "venue": "Stadium, near Bus Stand",
            "city": "Malerkotla",
            "totalPlayersAllowed": 5,
            "acceptedPlayers": 0,
            "totalPlayersApplied": 8,
            "eventDate": "2023-03-16T14:00:00.000Z",
            "__v": 0
            "players": [
              {
                 "name": "Rohit Hans",
                 "email": "rhans@icloud.com",
                "status": "accepted"
              }
            ]
        }

### /events/joinevent/:eventId

- User can apply to join an event

- If already user have sent a join request, and his status is pending, accepted or rejected user can not send join request again

> **headers.authorization*** : `Bearer ${token}`

> **:eventId***: `in endpoint's params is the Id of event, user wants to join`

> **return** (if request is successful)(sample output)  =>  

        {
            "msg": "Player's join request accepted successfully"
        }
        
### /events/canceljoinrequest/:eventId

- User can cancel the join request for an event

> **headers.authorization*** : `Bearer ${token}`

> **:eventId***: `in endpoint's params is the Id of event,for which user wants to cancel his join request`

> **return** (if request is successful)(sample output)  =>  

        {
            "msg": "Player's join request cancelled successfully"
        }
        
### /events/mybookings

- User can get the information of the all events, user applied for, with the joining status

> **headers.authorization*** : `Bearer ${token}`

> **return** (if request is successful)(sample output)  =>  

        {
            "status": "success",
            "myBookings": [
                {
                    "_id": "640c6587767ad69e40aa3a37",
                    "userId": "640aefb4b1f99e277a0434f1",
                    "eventId": "640b57c82260d251931e36a4",
                    "playerStatus": "accepted",
                    "eventName": "Punjab Cricket Tournament",
                    "venue": "Stadium, near Bus Stand",
                    "city": "Malerkotla",
                    "eventDate": "2023-03-16T14:00:00.000Z",
                    "totalPlayersAllowed": 5,
                    "acceptedPlayers": 1
                }]
        }
        
### /events/create

- User can create his own events, and other players can apply to join the event

> **headers.authorization*** : `Bearer ${token}`

> **headers.body***: `{
    "eventName": "Punjab Cricket Tournament",
    "gameName": "Cricket",
    "venue": "Stadium, near Bus Stand",
    "city":"Malerkotla",
    "totalPlayersAllowed":5,
    "eventDate": "2023-03-11",
    "startTime":"19:46",
    "endTime":"19:50"
  }`

> return (if request is successful) =>
                
        {
                "msg": "event created successfully"
        }
        
### /events/myevents

- User can get the information of the all events, user created.

> **headers.authorization*** : `Bearer ${token}`

> **return** (if request is successful)(sample output)  =>  

        {
         "status": "success",
         "data": [
            {
            "_id": "640df552455d515249ece55a",
            "organizerId": "640b47357e84f00e9519f727",
            "eventName": "Punjab Cricket Tournament",
            "gameName": "Cricket",
            "venue": "Stadium, near Bus Stand",
            "city": "Malerkotla",
            "totalPlayersAllowed": 5,
            "acceptedPlayers": 0,
            "totalPlayersApplied": 0,
            "eventDate": "2023-03-12T01:16:00.000Z",
            "__v": 0
            },
            {
            "_id": "640b57c82260d251931e36a4",
            "organizerId": "640b47357e84f00e9519f727",
            "eventName": "Punjab Cricket Tournament",
            "gameName": "Cricket",
            "venue": "Stadium, near Bus Stand",
            "city": "Malerkotla",
            "totalPlayersAllowed": 5,
            "acceptedPlayers": 1,
            "totalPlayersApplied": 10,
            "eventDate": "2023-03-16T14:00:00.000Z",
            "__v": 0
            }
                ]
        }
        
### /events/myevents/details/:eventId

-  user can get the info of the all players who have applied to the event, user created

> **headers.authorization*** : `Bearer ${token}`

> **:eventId***: `in endpoint's params is the Id of event`

> **return** (after token verification and request is successful)(sample output with players array(all players with their request status))  =>   

            {
                "status": "success",
                "data": {
                "_id": "640c8cdc05d425026558e5bf",
                "eventName": "Punjab Cricket Tournament",
                "gameName": "Cricket",
                "venue": "Stadium, near Bus Stand",
                "city": "Malerkotla",
                "totalPlayersAllowed": 5,
                "acceptedPlayers": 0,
                "totalPlayersApplied": 1,
                "eventDate": "2023-03-11T19:46:00.000Z",
                "users": [
                    {
                    "_id": "640c8cef05d425026558e5c3",
                    "userId": "640aefb4b1f99e277a0434f1",
                    "playerStatus": "rejected",
                    "name": "Rohit Hans",
                    "email": "rhans@icloud.com"
                    }
                ]
                }
        }
        
### /events/myevents/acceptplayer/:eventId

-  user(event organizer) can accept the join requst of the players who applied to join the event

> **headers.authorization*** : `Bearer ${token}`

> **headers.body***: `{playerId : (userId of the player)}`

> **:eventId***: `in endpoint's params is the Id of event`

> return (if request is successful) =>
 
        {msg:"Player's request accepted Successfully"}
        
### /events/myevents/rejectplayer/:eventId
-  user(event organizer) can reject the join requst of the players who applied to join the event

> **headers.authorization*** : `Bearer ${token}`

> **headers.body***: `{playerId : (userId of the player)}`

> **:eventId***: `in endpoint's params is the Id of event`

> return (if request is successful) =>
 
        {msg:"Player's request rejected Successfully"}
  
