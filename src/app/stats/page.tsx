'use client'
// MARUÍPE
import signIn from "@/firebase/auth/signIn";
import signUp from "@/firebase/auth/signup";
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from "react";
import { Appointment, getStat } from "@/firebase/firestore/appointments";
import { omit } from "lodash";


import { useToggle, upperFirst, useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Box,
  Button,
  LoadingOverlay,
  Anchor,
  Stack,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

import { notifications } from '@mantine/notifications';

export function StatsPage() {
  // const [type, toggle] = useToggle(['login', 'register']);
  const [isLoading, toggleIsLoading] = useDisclosure(false);
  const [ageStat, setAgeStat] = useState(0);
  

  const form = useForm({
    initialValues: {
      Neighbourhood: '',
      Gender: '',
    },
  });
  const router = useRouter();

  const handleForm = async ( values: typeof form.values) => {
    console.log(values);
    toggleIsLoading.open();
    const { result, error } = await getStat(values.Neighbourhood, values.Gender);
    console.log(result);
    console.log(error);;
    if ( error ) {
      // Display and log any sign-in errors
      console.log()
      notifications.show({
        color: 'red',
        title: 'Something Went Wrong.',
        message: 'Please try again.',
      })
    }
    console.log("got stats", result?.data().averagePatientAge);
    setAgeStat(result?.data().averagePatientAge || 0);

    toggleIsLoading.close();
  }

  return (
    <Paper className="flex flex-col items-center justify-center h-screen"  radius="md" p="xl" withBorder>
      <Text size="lg" fw={500}>
        Stats Page
      </Text>

      <form onSubmit={form.onSubmit(handleForm)}>
        <LoadingOverlay visible={isLoading}/>
        <Stack>
          <TextInput
            label="Neighbourhood"
            placeholder="Neighbourhood"
            value={form.values.Neighbourhood}
            onChange={(event) => form.setFieldValue('Neighbourhood', event.currentTarget.value)}
            radius="md"
          />
          <TextInput
            label="Gender"
            placeholder="Gender"
            value={form.values.Gender}
            onChange={(event) => form.setFieldValue('Gender', event.currentTarget.value)}
            radius="md"
          />
        </Stack>
        <Button type="submit" radius="xl" mt="md" mb="md">
          {upperFirst("Fetch Avg Age")}
        </Button>
      </form>

      {`Average Age is: ${ageStat}`}
    </Paper>
  );
}

export default StatsPage;
