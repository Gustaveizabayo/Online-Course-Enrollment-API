import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Register request:', { name, email, role });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: '123', name, email, role },
      token: 'dummy-jwt-token'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request:', { email });
    
    res.json({
      message: 'Login successful',
      user: { 
        id: '123', 
        name: 'Test User', 
        email, 
        role: 'STUDENT' 
      },
      token: 'dummy-jwt-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};