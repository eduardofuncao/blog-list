const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    }
]

const nonExistingId = async () => {
    const blog  = new Blog({ title: 'The art of war', author: 'Sun Tzu', url: 'https://en.wikipedia.org/wiki/The_Art_of_War', likes: 10 })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDB = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = { 
    initialBlogs,
    nonExistingId,
    blogsInDB,
    usersInDB
}