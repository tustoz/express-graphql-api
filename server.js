const express = require('express')
const app = express()

const {
    graphqlHTTP
} = require('express-graphql')

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const books = require('./db/books');
const authors = require('./db/authors');

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        authorId: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Single Book',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (_, args) => {
                books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => {
                return books
            }
        },
        author: {
            type: AuthorType,
            description: 'A Single Author',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (_, args) => {
                authors.find(author => author.id === args.id)
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => {
                return authors
            }
        }

    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (_, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        updateBook: {
            type: BookType,
            description: 'Update a book',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                authorId: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            resolve: (_, args) => {
                const book = books.find(book => book.id === args.id)

                if (!book) {
                    return "Book not found"
                }

                book.id = args.id
                book.name = args.name
                book.authorId = args.authorId

                return book
            }
        },
        deleteBook: {
            type: BookType,
            description: 'Delete a book',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (_, args) => {
                const book = books.find(book => book.id === args.id)
                books.splice(books.indexOf(book), 1)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (_, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(author)
                return author
            }
        },
        deleteAuthor: {
            type: AuthorType,
            description: 'Delete an author',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (_, args) => {
                const author = authors.find(author => author.id === args.id)
                authors.splice(authors.indexOf(author), 1)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log('server ready at http://localhost:5000/'))