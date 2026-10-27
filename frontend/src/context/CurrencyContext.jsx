import React, { createContext, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const format = (amount) => {
    // Format to integer with non-breaking spaces for thousands
    const formattedNumber = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
    return `${formattedNumber}\u00A0DA`;
  };

  return (
    <CurrencyContext.Provider value={{ format, currencyCode: 'DZD' }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useMoney = () => useContext(CurrencyContext);
