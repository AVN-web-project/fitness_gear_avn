// Simulated Backend User Database
let users = [
  {
    id: 'usr-admin-101',
    fullName: 'Vikram Malhotra',
    email: 'admin@avngear.com',
    password: 'password123',
    phone: '+91 98765 43210',
    role: 'admin',
    tier: 'AVN ADMIN',
    memberSince: '2023',
    addresses: [
      {
        id: 'addr-demo-1',
        fullName: 'Vikram Malhotra',
        phone: '+91 98765 43210',
        houseNo: 'House No. 42-B',
        flatNo: 'Flat 402, 4th Floor',
        street: 'Pinnacle Heights, Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        type: 'HOME',
        landmark: 'Near DLF Cyber Hub',
        isDefault: true
      }
    ]
  },
  {
    id: 'usr-cust-202',
    fullName: 'Karan Sharma',
    email: 'customer@avngear.com',
    password: 'password123',
    phone: '+91 91234 56789',
    role: 'customer',
    tier: 'AVN ELITE CUSTOMER',
    memberSince: '2024',
    addresses: []
  }
];

export const registerUser = (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const userExists = users.some(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    fullName: name || 'New AVN Athlete',
    email,
    password,
    phone: phone || '+91 98765 43210',
    role: 'customer',
    tier: 'AVN MEMBER',
    memberSince: new Date().getFullYear().toString(),
    addresses: []
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      tier: newUser.tier,
      memberSince: newUser.memberSince
    }
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
      memberSince: user.memberSince
    }
  });
};

export const getUserProfile = (req, res) => {
  // Return the first admin or user profile for profile loading simulation
  const user = users[0];
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
      memberSince: user.memberSince
    }
  });
};
