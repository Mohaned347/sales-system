import { createContext, useContext, useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { ProductProvider } from './productContext';
import { SalesProvider } from './salesContext';
import { CustomerProvider } from './customerContext';
import { AnalyticsProvider } from './analyticsContext';
import { InvoiceProvider } from './invoiceContext';
import { parseFirebaseDate, getUserCollection } from './hooks';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);

  return (
    <AuthProvider>
      <ProductProvider>
        <SalesProvider>
          <CustomerProvider>
            <AnalyticsProvider>
              <InvoiceProvider>
                <AppContext.Provider
                  value={{
                    loading,
                    setLoading,
                    parseFirebaseDate,
                    getUserCollection
                  }}
                >
                  {children}
                </AppContext.Provider>
              </InvoiceProvider>
            </AnalyticsProvider>
          </CustomerProvider>
        </SalesProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};