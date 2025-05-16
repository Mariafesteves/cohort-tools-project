
const jwt = require("jsonwebtoken");


const isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token not provided" });
        }

        const payload = jwt.verify(token, process.env.TOKEN_SECRET);

        req.payload = payload;

        next();
    } catch (error) {
        res.status(401).json({ message: "Token not valid or expired" });
    }
};

module.exports = {
    isAuthenticated,
};