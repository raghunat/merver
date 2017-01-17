# Merver
A simple sequence mock API Server. This is intended to make functional UI tests easier for SPA applications

Merver will serve API endpoints according to a YAML definition. What makes this different than other mock servers, is that you can have sequenced responses for your use cases. For example:

1. POST /login fails with 403 (assumed bad credentials)
2. POST /login succeeds the second time with 200 (assumed good credentials)
3. GET /user/1 gives back a user with name = "Laura Johnson"
4. PUT /user/1 gives back a user with name = "Laura Raghunath"
5. GET /user/1 gives back a user with name = "Laura Raghunath"

Example YAML for above:
```yaml
---
routes:
  "/login":
    POST:
      responses:
      - response:
          message: Invalid Password
        status: 403
      - response:
          id: 1
          name: Laura Johnson
        status: 200
  "/user/1":
    GET:
      response:
        name: Laura Johnson
    PUT:
      response:
        name: Laura Raghunath
      update:
        "/user/1":
          GET:
            response:
              name: Laura Raghunath
```

## GET /_docs
```
This readme in in markdown
```

## POST /_setup
```javascript
{
    "YAML":"YAML Definition"
}
```

## POST /_setup/file
```javascript
{
    "path":"Absolute YAML File Path"
}
```

## GET /_merver
```javascript
{
    "rawYAML": "Raw YAML Text",
    "definition": {
        // JSON definition
    }
}
```
