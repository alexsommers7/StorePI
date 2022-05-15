# StorePI

StorePI is a free, open-source REST API that was created for use in e-commerce prototyping, Front-End Developer talent evaluations, and anything else you can think of.

🔗 **[Full Documentation](https://documenter.getpostman.com/view/12907395/UyxjF694)**

## Data

- Products
- Categories
- Reviews
- Users
- Carts
- Purchases
- Wishlist
- Authentication

## Database Interaction

All endpoints act as real-world endpoints, but without actually writing anything to the database.

## Rate Limiting

The rate limit for a given IP address is 300 requests per hour. If you require a higher rate limit for your use case, please submit an issue or contact me directly at **alex@alexsommers.com**.

## Authentication

In order to provide a variety in the data, there are 19 user accounts available. You may log in as any of the 19 users. The structure of each user's email address is [firstName]@example.com, and each user's password is simply 'password'. You may log in as any of the following users: Dorothy, Jodi, Shari, Jimmy, Daisy, Amy, Candace, Marco, Dustin, Casey, Jean, Cody, Kelly, Phil, Aubrey, Bennie, Ramone, Perry, or Tracy.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and hot-reloads for production

```
npm run start:prod
```

### Debug with NDB

```
npm run debug
```

## License

MIT License

Copyright (c) 2022 Alex Sommers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
