const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Verificar credenciales contra variables de entorno
      if (email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10));
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { email: email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController;
