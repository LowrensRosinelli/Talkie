# Talkie

Talkie is a small social media frontend made for the JavaScript 2 course at Noroff.  
The app uses the Noroff API v2 (Social) so a user can register, log in and work with posts.

## Features

- Register a new user (using `stud.noroff.no` email)
- Log in and keep the user stored in localStorage
- View all posts in a feed
- View a single post on its own page
- Create a new post
- Edit your own posts
- Delete your own posts
- View posts from another user
- View your own profile
- Follow / unfollow other users
- Search posts from the feed page

Authentication is done with JWT (access token from the Noroff Auth API) together with an API key.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript (ES6 modules)
- Noroff API v2 (Auth + Social)

No frontend frameworks (React, Vue, Angular) are used.
