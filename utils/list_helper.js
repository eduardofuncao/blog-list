const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes,0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else if (blogs.length === 1) {
        return blogs[0]
    } else {
        return blogs.reduce((mostLikedBlog, currentBlog) => {
            console.log('mostliked: ', mostLikedBlog);
            console.log('current', currentBlog);
            if (currentBlog.likes > mostLikedBlog.likes) {
                return currentBlog
            } else {
                return mostLikedBlog
            }
        })
    }
}

const mostProlificAuthor = (blogs) => {
    const blogsPerAuthor = (blogs) => {
         return blogs.reduce((authors, blog) => {
            const author = blog.author
            if (!authors[author]) {
                authors[author] = {
                    author: author,
                    blogs: 0
                }
            }
            authors[author].blogs += 1
            return authors
         }, {}) 
    }

    if (blogs.length === 0) {
        return {}
    }

    const authors = blogsPerAuthor(blogs)
    maxBlogs = Math.max(...Object.values(authors).map(author => author.blogs))
    return Object.values(authors).find(author => author.blogs === maxBlogs)
}

const mostLikedAuthor = (blogs) => {
    const likesPerAuthor = (blogs) => {
        return blogs.reduce((authors, blog) => {
            const author = blog.author
            if (!authors[author]) {
                authors[author] = {
                    author: author,
                    likes: 0
                }
            }
            authors[author].likes += blog.likes
            return authors
        },{})
    }

    if (blogs.length === 0) return {}

    const authors = likesPerAuthor(blogs)
    maxLikes = Math.max(...Object.values(authors).map(author => author.likes))
    return Object.values(authors).find(author => author.likes === maxLikes)

}


const blogs = [
            {
                _id: "5a422a851b54a676234d17f7",
                title: "React patterns",
                author: "Michael Chan",
                url: "https://reactpatterns.com/",
                likes: 7,
                __v: 0
            },
            {
                _id: "5a422aa71b54a676234d17f8",
                title: "Go To Statement Considered Harmful",
                author: "Edsger W. Dijkstra",
                url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
                likes: 5,
                __v: 0
            },
            {
                _id: "5a422b3a1b54a676234d17f9",
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12,
                __v: 0
            },
            {
                _id: "5a422b891b54a676234d17fa",
                title: "First class tests",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
                likes: 10,
                __v: 0
            },
            {
                _id: "5a422ba71b54a676234d17fb",
                title: "TDD harms architecture",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                likes: 0,
                __v: 0
            },
            {
                _id: "5a422bc61b54a676234d17fc",
                title: "Type wars",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
                likes: 2,
                __v: 0
            }  
        ]

/*
blogs =[{
                _id: "5a422bc61b54a676234d17fc",
                title: "Type wars",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
                likes: 2,
                __v: 0
            }]
*/
console.log(mostLikedAuthor(blogs));

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostProlificAuthor,
    mostLikedAuthor
}


