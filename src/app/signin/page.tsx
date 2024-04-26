'use client'
import signIn from "@/firebase/auth/signIn";
import signUp from "@/firebase/auth/signup";
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from "react";
import { omit } from "lodash";


import { useToggle, upperFirst, useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  LoadingOverlay,
  Anchor,
  Stack,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

import { notifications } from '@mantine/notifications';

export function AuthenticationForm() {
  const [type, toggle] = useToggle(['login', 'register']);
  const [isLoading, toggleIsLoading] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      address: '',
      insuranceId: '',
      phone: '',
      dob: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 4 ? 'Password should include at least 5 characters' : null),
      phone: (val) => (type === 'register' && (val.length !== 10 || !(/^\d+$/.test(val))) ? 'Phone number is not 10 digits number' : null),
      insuranceId: (val) => (type === 'register' && (val.length !== 9 || !(/^\d+$/.test(val)))? 'Insurance number is not 9 digits number' : null),
    },
  });
  const router = useRouter();

  const handleForm = async ( values: typeof form.values) => {
    console.log(values);
    toggleIsLoading.open();
    // event?.preventDefault();
    // Attempt to sign in with provided email and password
    if (type === 'login') {
      const { result, error } = await signIn( values.email, values.password );
      toggleIsLoading.close();
      if ( error ) {
        // Display and log any sign-in errors
        notifications.show({
          color: 'red',
          title: 'Something Went Wrong.',
          message: 'Please check email and password.',
        })
        console.log( error );
        return;
      }
      // Sign in successful
      console.log( result );
      router.push( "/home" );
    } else if (type === 'register') {
      const { result, error } = await signUp( values );
      toggleIsLoading.close();
      if ( error ) {
        // Display and log any sign-in errors
        notifications.show({
          color: 'red',
          title: 'Something Went Wrong.',
          message: 'Please try again.',
        })
        console.log( error );
        return;
      }
      // Sign up successful
      console.log( result );
      router.push( "/home" );
    }
    toggleIsLoading.close();
  }

  return (
    <Paper className="flex flex-col items-center justify-center h-screen"  radius="md" p="xl" withBorder>
      <Text size="lg" fw={500}>
        Welcome to Patient Portal, {type} with
      </Text>

      <form onSubmit={form.onSubmit(handleForm)}>
        <LoadingOverlay visible={isLoading}/>
        <Stack>
          <TextInput
            required
            label="Email"
            placeholder="your@email.com"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
          />
{/* dob
address
inssuranceid
phone */}
          {type === 'register' && (
            <TextInput
              required
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              error={form.errors.name && 'Invalid name'}
              radius="md"
            />
          )}
          {type === 'register' && (
            <TextInput
              required
              label="Address"
              placeholder="Your address"
              value={form.values.address}
              onChange={(event) => form.setFieldValue('address', event.currentTarget.value)}
              radius="md"
            />
          )}
          {type === 'register' && (
            <TextInput
              required
              label="Phone Number"
              placeholder="Your phone number"
              value={form.values.phone}
              onChange={(event) => form.setFieldValue('phone', event.currentTarget.value)}
              error={form.errors.phone && 'Invalid phone'}
              radius="md"
            />
          )}
          {type === 'register' && (
            <TextInput
              required
              label="Health Insurance"
              placeholder="Your health insurance number"
              value={form.values.insuranceId}
              onChange={(event) => form.setFieldValue('insuranceId', event.currentTarget.value)}
              error={form.errors.insuranceId && 'Invalid insurance number'}
              radius="md"
            />
          )}
          {type === 'register' && (
            <DateInput
              required
              label="Date of Birth"
              placeholder="Your Date of Birth"
              valueFormat="YYYY MMM DD"
              value={form.values.dob ? new Date(form.values.dob) : undefined}
              onChange={(val) => form.setFieldValue('dob', val?.toISOString() || '')}
              radius="md"
            />
          )}

          {/* {type === 'register' && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )} */}
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

function Page(): JSX.Element {
  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const router = useRouter();

  // Handle form submission
  const handleForm = async ( event: { preventDefault: () => void } ) => {
    event.preventDefault();

    // Attempt to sign in with provided email and password
    const { result, error } = await signIn( email, password );

    if ( error ) {
      // Display and log any sign-in errors
      console.log( error );
      return;
    }

    // Sign in successful
    console.log( result );

    // Redirect to the admin page
    // Typically you would want to redirect them to a protected page an add a check to see if they are admin or 
    // create a new page for admin
    router.push( "/admin" );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form onSubmit={handleForm} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl font-bold mb-6 text-black">Sign In</h1>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              onChange={( e ) => setEmail( e.target.value )}
              required
              type="email"
              name="email"
              id="email"
              placeholder="example@mail.com"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              onChange={( e ) => setPassword( e.target.value )}
              required
              type="password"
              name="password"
              id="password"
              placeholder="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthenticationForm;
// export default Page;
