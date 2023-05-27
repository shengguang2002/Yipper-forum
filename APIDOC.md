# Yipper API Documentation
This API is designed to serve Yips (tweets) for a Yipper (Twitter clone) web application.

## Yips Endpoint
**Request Format:** /yipper/yips?search=<search_text>

**Request Type:** GET

**Returned Data Format**: JSON

**Description:**  This endpoint returns a list of Yips. If a search query is provided, it
 returns Yips that match the search text.


**Example Request:**  http://localhost:8000/yipper/yips?search=hello

**Example Response:**
[
  {
    "id": 1,
    "name": "Alice",
    "yip": "Hello, world!",
    "hashtag": "greetings",
    "likes": 10,
    "date": "2023-05-16T07:00:00Z"
  },
  ...
]


**Error Handling:**
Possible 500 (server error) error

## User Endpoint
**Request Format:** /yipper/user/<user_name>

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint returns a list of Yips from the given user. If no Yips are
 found for the user, it will return an error.


**Example Request:**   http://localhost:8000/yipper/user/Alice
**Example Response:**
[
  {
    "name": "Alice",
    "yip": "Hello, world!",
    "hashtag": "greetings",
    "date": "2023-05-16T07:00:00Z"
  },
  ...
]

**Error Handling:**
Possible 400 (invalid request) error if user does not exist.
Possible 500 (server error) error

## Likes Endpoint
**Request Format:** /yipper/likes

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:**  This endpoint increments the like count for a given Yip and returns the
 new like count. The Yip id must be provided in the request body.


**Example Request:**  POST to http://localhost:8000/yipper/likes with body { "id": 1 }

**Example Response:**
11


**Error Handling:**
Possible 400 (invalid request) error if Yip id is not provided
Possible 500 (server error) error

## New Yip Endpoint
**Request Format:** /yipper/new

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** This endpoint creates a new Yip with the provided user name and Yip text.
 The user name and full Yip (including hashtag) must be provided in the request body.

**Example Request:**  POST to http://localhost:8000/yipper/new with body { "name": "Alice",
 "full": "Hello again, world! #greetings" }

**Example Response:**
{
  "id": 2,
  "name": "Alice",
  "yip": "Hello again, world!",
  "hashtag": "greetings",
  "likes": 0,
  "date": "2023-05-16T07:10:00Z"
}

**Error Handling:**
Possible 400 (invalid request) error if user name or full Yip is not provided
Possible 500 (server error) error