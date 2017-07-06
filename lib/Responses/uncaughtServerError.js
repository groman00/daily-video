module.exports = (res) => {
    res.status(500).send({
        error: {
            code: 500,
            message: 'Internal Server Error'
        }
    });
};
