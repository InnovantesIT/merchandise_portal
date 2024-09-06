import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  customer_id: number;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data from localStorage or any other storage if needed
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
