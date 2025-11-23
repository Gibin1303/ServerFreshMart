import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  
  if (!token) {
    return res.json({ success: false, message: "Not Authorized" });
  }
  
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    if (tokenDecode?.id) {
      // Initialize req.body if it doesn't exist
      if (!req.body) {
        req.body = {};
      }
      req.body.userId = tokenDecode.id;
      
      // Or alternatively, use req.user instead
      // req.user = { id: tokenDecode.id };
      
      next();
    } else {
      return res.json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;



