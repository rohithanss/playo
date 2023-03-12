# playo

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
### /events/mybookings
### /events/create
### /events/myevents
### /events/myevents/details/:eventId
### /events/myevents/acceptplayer/:eventId
### /events/myevents/rejectplayer/:eventId
