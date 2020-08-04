function errorHandle(renderPage) {
    return (err, req, res, next) => {
        let error = ''
        console.log(err.name)
        if (typeof (errorMessages[err.name]) === 'function') {
            error = errorMessages[err.name]()

        } else {
            error = err.message
        }
        return res.render(renderPage, { error, loggedIn: req.user })
    }
}

const errorMessages = {
    'TokenExpiredError': () => {
        return 'Your session has expired please login again'
    },
    'TypeError': () => {
        return 'Unexpected error please try again later'
    }

}

module.exports = errorHandle
