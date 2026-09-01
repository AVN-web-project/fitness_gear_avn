// Simulated Backend User Database
let users = [
  {
    id: 'usr-cust-202',
    fullName: 'Karan Sharma',
    email: 'customer@avngear.com',
    password: 'password123',
    phone: '+91 91234 56789',
    role: 'customer',
    tier: 'AVN ELITE CUSTOMER',
    memberSince: '2024',
    addresses: [
      {
        id: 'addr-default-1',
        fullName: 'Karan Sharma',
        phone: '+91 91234 56789',
        flatNo: 'Flat 402, Building A',
        houseNo: 'Building A, Wing B',
        street: 'DLF Cyber City, Sector 24',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        type: 'Home',
        isDefault: true
      }
    ]
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
      memberSince: newUser.memberSince,
      addresses: newUser.addresses
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
      memberSince: user.memberSince,
      addresses: user.addresses || []
    }
  });
};

export const getUserProfile = (req, res) => {
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
      memberSince: user.memberSince,
      addresses: user.addresses || []
    }
  });
};

export const updateUserProfile = (req, res) => {
  const { id, name, email, oldEmail, phone, currentPassword, verificationCode } = req.body;

  const targetEmail = oldEmail || email;
  const user = users.find(u => u.id === id || u.email.toLowerCase() === (targetEmail || '').toLowerCase());
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found' });
  }

  // Check if email is changing
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    if (!currentPassword && verificationCode !== '849201') {
      return res.status(400).json({
        success: false,
        requiresEmailVerification: true,
        message: 'Current email verification required to change email address'
      });
    }

    if (currentPassword && user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password for current email verification'
      });
    }

    const emailTaken = users.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase());
    if (emailTaken) {
      return res.status(400).json({ success: false, message: 'An account with the new email already exists' });
    }

    user.email = email;
  }

  if (name) user.fullName = name;
  if (phone) user.phone = phone;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
      memberSince: user.memberSince,
      addresses: user.addresses || []
    }
  });
};
