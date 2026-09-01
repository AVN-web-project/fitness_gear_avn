// In-memory support ticket database
let supportTickets = [
  {
    id: 'TCK-9021',
    userEmail: 'customer@avngear.com',
    userName: 'Karan Sharma',
    subject: 'Size exchange for Knee Wraps',
    category: 'Exchange',
    orderId: 'AVN-ORD-1001',
    message: 'Need to swap 79" knee wraps for 90" version.',
    status: 'In Review',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Automated support assistant Q&A responses
const botKnowledge = [
  {
    keywords: ['return', 'refund', 'exchange', 'policy'],
    answer: 'AVN Athletics offers a 10-day hassle-free return and size exchange policy for unused equipment in original packaging. You can initiate a return directly under Orders & Returns or contact us here.'
  },
  {
    keywords: ['shipping', 'delivery', 'dispatch', 'time', 'track'],
    answer: 'Standard express shipping takes 2-4 business days across India. Orders placed before 2 PM IST are dispatched on the same business day with SMS tracking updates.'
  },
  {
    keywords: ['warranty', 'guarantee', 'broken', 'damage', 'tear'],
    answer: 'All AVN competition belts and wraps are backed by a 12-month heavy-duty structural warranty covering stitching and lever/buckle hardware defects.'
  },
  {
    keywords: ['size', 'sizing', 'fit', 'belt', 'wrap'],
    answer: 'Refer to our interactive Size Chart on any product page. For power belts, measure around your navel at tightest waist (do not use pant size).'
  },
  {
    keywords: ['payment', 'cod', 'cash', 'upi', 'card'],
    answer: 'We support UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD) on eligible pin codes.'
  }
];

export const createSupportTicket = (req, res) => {
  const { userEmail, userName, subject, category, orderId, message } = req.body;

  if (!message || !userEmail) {
    return res.status(400).json({
      success: false,
      message: 'Email and message are required to submit a ticket.'
    });
  }

  const newTicket = {
    id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
    userEmail,
    userName: userName || 'AVN Athlete',
    subject: subject || 'General Support Inquiry',
    category: category || 'General',
    orderId: orderId || 'N/A',
    message,
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  supportTickets.push(newTicket);

  res.status(201).json({
    success: true,
    message: 'Support ticket submitted successfully! Reference ID: ' + newTicket.id,
    ticket: newTicket
  });
};

export const getSupportTickets = (req, res) => {
  const email = (req.query.email || '').toLowerCase();
  const filtered = email
    ? supportTickets.filter((t) => (t.userEmail || '').toLowerCase() === email)
    : supportTickets;

  res.json({
    success: true,
    data: filtered
  });
};

export const handleSupportChat = (req, res) => {
  const { message } = req.body;
  const lowerMsg = (message || '').toLowerCase();

  const match = botKnowledge.find((item) =>
    item.keywords.some((kw) => lowerMsg.includes(kw))
  );

  const reply = match
    ? match.answer
    : "Thank you for contacting AVN Athlete Support! I've noted your message. If you need dedicated assistance, click 'Submit Ticket' below to connect with an AVN support agent.";

  res.json({
    success: true,
    reply
  });
};
