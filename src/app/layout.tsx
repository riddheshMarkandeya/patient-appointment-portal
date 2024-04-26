import { AuthContextProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { MantineProvider, ColorSchemeScript, createTheme, MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
// import {
//   QueryClient,
//   QueryClientProvider,
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';
import { ModalsProvider, modals } from '@mantine/modals';

// Load the Inter font with 'latin' subset
const inter = Inter( { subsets: [ 'latin' ] } );

// Metadata for the application
export const metadata = {
  title: 'Patient Appointment Portal',
  description: 'Template to use Next.js with Firebase',
};

const myColor: MantineColorsTuple = [
  '#f6ecff',
  '#e7d6fb',
  '#caabf1',
  '#ac7ce8',
  '#9354e0',
  '#833cdb',
  '#7b2eda',
  '#6921c2',
  '#5d1cae',
  '#501599'
];

const theme = createTheme({
  colors: {
    myColor,
  }
});

// const queryClient = new QueryClient();

// Root layout component for the application
export default function RootLayout( { children }: { children: React.ReactNode } ): JSX.Element {
  return (
    <html lang="en">
      {/*
        The <head /> component will contain the components returned by the nearest parent
        head.js. It can be used to define the document head for SEO, metadata, and other purposes.
        Learn more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        {/* Wrap the children with the AuthContextProvider to provide authentication context */}
        <MantineProvider theme={theme}>
          {/* <QueryClientProvider client={queryClient}> */}
            <ModalsProvider>
              <AuthContextProvider>
                <Notifications />
                {children}
              </AuthContextProvider>
            </ModalsProvider>
          {/* </QueryClientProvider> */}
        </MantineProvider>
      </body>
    </html>
  );
}
