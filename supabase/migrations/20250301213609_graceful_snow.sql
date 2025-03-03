/*
  # Initial Schema Setup

  1. New Tables
    - `users` - Stores user information
    - `accounts` - Stores messaging platform accounts (Instagram, WhatsApp, etc.)
    - `contacts` - Stores customer contacts
    - `messages` - Stores message history
    - `contact_labels` - Junction table for contacts and labels
    - `labels` - Stores label definitions
    - `orders` - Stores order information
    - `templates` - Stores message templates
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  last_sign_in TIMESTAMPTZ
);

-- Accounts table (Instagram, WhatsApp, Messenger accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT,
  page_id TEXT,
  ig_user_id TEXT,
  phone_number_id TEXT,
  business_id TEXT,
  external_id TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(account_id, external_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Contact-Label junction table
CREATE TABLE IF NOT EXISTS contact_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  UNIQUE(contact_id, label_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  shipping_company TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  return_reason TEXT,
  return_date TIMESTAMPTZ,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read their own accounts
CREATE POLICY "Users can read own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own accounts
CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Users can read contacts for their accounts
CREATE POLICY "Users can read contacts for their accounts" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = contacts.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can insert contacts for their accounts
CREATE POLICY "Users can insert contacts for their accounts" ON contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = contacts.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can update contacts for their accounts
CREATE POLICY "Users can update contacts for their accounts" ON contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = contacts.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can read messages for their contacts
CREATE POLICY "Users can read messages for their contacts" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = messages.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can insert messages for their contacts
CREATE POLICY "Users can insert messages for their contacts" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = messages.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can read their own labels
CREATE POLICY "Users can read own labels" ON labels
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own labels
CREATE POLICY "Users can insert own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own labels
CREATE POLICY "Users can update own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own labels
CREATE POLICY "Users can delete own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- Users can read contact_labels for their contacts
CREATE POLICY "Users can read contact_labels for their contacts" ON contact_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = contact_labels.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can insert contact_labels for their contacts
CREATE POLICY "Users can insert contact_labels for their contacts" ON contact_labels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = contact_labels.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can delete contact_labels for their contacts
CREATE POLICY "Users can delete contact_labels for their contacts" ON contact_labels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = contact_labels.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can read orders for their contacts
CREATE POLICY "Users can read orders for their contacts" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = orders.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can insert orders for their contacts
CREATE POLICY "Users can insert orders for their contacts" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = orders.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can update orders for their contacts
CREATE POLICY "Users can update orders for their contacts" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contacts
      JOIN accounts ON contacts.account_id = accounts.id
      WHERE contacts.id = orders.contact_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Users can read their own templates
CREATE POLICY "Users can read own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own templates
CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);