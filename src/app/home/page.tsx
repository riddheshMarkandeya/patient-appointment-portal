'use client'
import { useAuthContext } from "@/context/AuthContext";
import { Appointment, getAppointmentsBatch, update, create, deleteApp } from "@/firebase/firestore/appointments";
import { useDisclosure } from '@mantine/hooks';
import { Badge, Group, Pagination, Box, Modal } from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from "next/navigation";
// import {
//   DataGrid,
//   DataGridPaginationState,
//   OnChangeCallback,
//   booleanFilterFn,
//   dateFilterFn,
//   highlightFilterValue,
//   numberFilterFn,
//   stringFilterFn,
// } from 'mantine-data-grid';
import _ from 'lodash';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_TableOptions,
} from 'mantine-react-table';
import { useForm } from '@mantine/form';
import {
  TextInput,
  NumberInput,
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
  Checkbox,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ModalsProvider, modals } from '@mantine/modals';


import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Elsie } from "next/font/google";

// type FetchResponse = {
//   list: Appointment[];
//   total: number;
// };

type AppointmentResponse = {
  data: Array<Appointment>;
  meta: {
    totalRowCount: number;
  };
};


function Page(): JSX.Element {
  // Access the user object from the authentication context
  // const { user } = useAuthContext();
  const { user } = useAuthContext() as { user: any }; // Use 'as' to assert the type as { user: any }
  const router = useRouter();

  useEffect( () => {
    // Redirect to the home page if the user is not logged in
    if ( user == null ) {
      router.push( "/signin" );
    }
    // }, [ user ] );
  }, [ user, router ] ); // Include 'router' in the dependency array to resolve eslint warning

  const [data, setData] = useState<Appointment[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });
  let oldPageIndex = 0;
  const [opened, { open, close }] = useDisclosure(false);
  const [isEdit, setIsEdit] = useState(false);
  const form = useForm({
    initialValues: {
      PatientId: '',
      AppointmentID: '',
      Gender: '',
      // ScheduledDay: '',
      // AppointmentDay: '',
      Age: 0,
      Neighbourhood: '',
      Scholarship: false,
      Hipertension: false,
      Diabetes: false,
      Alcoholism: false,
      Handicap: false,
      SMSReceived: false,
      NoShow: false
    },
  });

  function fetchAppData(isFirst: boolean, isNext: boolean): Promise<AppointmentResponse> {

    return new Promise(async (resolve, reject) => {
      const {result, error} = await getAppointmentsBatch(isFirst, isNext);
      if (error) {
        reject(error);
        return;
      }
      console.log(result);
      resolve({
        data: result,
        meta: {
          totalRowCount: 38860
        }
      });
    });
  
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      }
      console.log(oldPageIndex, pagination.pageIndex);
      try {
        const response = await fetchAppData(pagination.pageIndex === 0, pagination.pageIndex > oldPageIndex);
        oldPageIndex = pagination.pageIndex;
        
        setData(response.data);
        setRowCount(response.meta.totalRowCount);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.pageIndex, //refetch when page index changes
    pagination.pageSize, //refetch when page size changes
    isLoading,
  ]);

  const handleForm = async ( values: typeof form.values) => {
    console.log(values);
    console.log("isEdit", isEdit);
    setIsLoading(true);
    // toggleIsLoading.open();
    // event?.preventDefault();
    // Attempt to sign in with provided email and password
    if (isEdit) {
      const { result, error } = await update( values.AppointmentID, values );
      // toggleIsLoading.close();
      if ( error ) {
        // Display and log any sign-in errors
        notifications.show({
          color: 'red',
          title: 'Something Went Wrong.',
          message: 'Please try again.',
        })
      }
      console.log( result );
    } else {
      const { result, error } = await create( values );
      // toggleIsLoading.close();
      if ( error ) {
        // Display and log any sign-in errors
        notifications.show({
          color: 'red',
          title: 'Something Went Wrong.',
          message: 'Please try again.',
        })
        console.log( error );
      }
      // // Sign up successful
      console.log( result );
      // router.push( "/home" );
    }
    setIsLoading(false);
    close();
  }

  const handleDelete= async(id: string) => {
    console.log("delete appointment", id);
    setIsLoading(true);
    const { result, error } = await deleteApp( id );
    // toggleIsLoading.close();
    if ( error ) {
      // Display and log any sign-in errors
      notifications.show({
        color: 'red',
        title: 'Something Went Wrong.',
        message: 'Please try again.',
      })
    }
    console.log( result );
    setIsLoading(false);
  }

  const columns = useMemo<MRT_ColumnDef<Appointment>[]>(
    () => [
      {
        accessorKey: 'PatientId',
        header: 'PatientId',
      },
      {
        accessorKey: 'AppointmentID',
        header: 'AppointmentID',
      },
  //     PatientId: string,
  // AppointmentID: string,
  // Gender: string,
  // ScheduledDay: Timestamp,
  // AppointmentDay: Timestamp,
  // Age: number,
  // Neighbourhood: string,
  // Scholarship: boolean,
  // Hipertension: boolean,
  // Diabetes: boolean,
  // Alcoholism: boolean,
  // Handicap: boolean,
  // SMSReceived: boolean,
  // NoShow: boolean
      {
        accessorKey: 'Gender',
        header: 'Gender',
      },
      {
        accessorKey: 'Age',
        header: 'Age',
      },
      // {
      // //   // accessorKey: 'ScheduledDay',
      //   header: 'ScheduledDay',
      //   accessorFn: (row) => row.ScheduledDay.toDate().toDateString(),
      // },
      // {
      //   // accessorKey: 'AppointmentDay',
      //   header: 'AppointmentDay',
      //   accessorFn: (row) => row.AppointmentDay.toDate().toISOString(),
      // },
      {
        accessorKey: 'Neighbourhood',
        header: 'Neighbourhood',
      },
      {
        // accessorKey: 'Scholarship',
        header: 'Scholarship',
        accessorFn: (row) => row.Scholarship ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'Hipertension',
        header: 'Hipertension',
        accessorFn: (row) => row.Hipertension ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'Diabetes',
        header: 'Diabetes',
        accessorFn: (row) => row.Diabetes ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'Alcoholism',
        header: 'Alcoholism',
        accessorFn: (row) => row.Alcoholism ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'Handicap',
        header: 'Handicap',
        accessorFn: (row) => row.Handicap ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'NoShow',
        header: 'NoShow',
        accessorFn: (row) => row.NoShow ? 'Yes' : 'No',
      },
      {
        // accessorKey: 'SMSReceived',
        header: 'SMSReceived',
        accessorFn: (row) => row.SMSReceived ? 'Yes' : 'No',
      },


      // {
      //   accessorKey: 'state',
      //   header: 'State',
      // },
      // {
      //   accessorKey: 'phoneNumber',
      //   header: 'Phone Number',
      // },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data,
    getRowId: (row) => row.AppointmentID,
    rowCount,
    enableColumnFilters: false,
    onPaginationChange: setPagination,
    enableRowActions: true,
    initialState: { density: 'xs' },
    renderRowActions: ({ row }) => (
      <Box>
        <ActionIcon onClick={() => {
            setIsEdit(true);
            // let foo = _.pick(row, ["PatientId", "AppointmentID", "Gender", "ScheduledDay", "AppointmentDay", "Age", "Neighbourhood", "Scholarship", "Hipertension", "Diabetes", "Alcoholism", "Handicap", "SMSReceived", "NoShow"]);

            form.setValues(row.original);
            open()
          }}>
          <IconEdit />
        </ActionIcon>
        <ActionIcon onClick={() => {
          handleDelete(row.id);
        }}>
          <IconTrash />
        </ActionIcon>
      </Box>),
    state: {
      isLoading,
      pagination,
      showAlertBanner: isError,
    },
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: 'red', children: 'Error loading data' }
      : undefined,
  });

  return (<>
    <Modal opened={opened} onClose={close} title={`${isEdit ? "Edit" : "Create"} Appointment`} centered>
      {/* Modal content */}
      {/* PatientId: '',
      AppointmentID: '',
      Gender: '',
      ScheduledDay: '',
      AppointmentDay: '',
      Age: '',
      Neighbourhood: '',
      Scholarship: '',
      Hipertension: '',
      Diabetes: '',
      Alcoholism: '',
      Handicap: '',
      SMSReceived: '',
      NoShow: '' */}
      <form onSubmit={form.onSubmit(handleForm)}>
        <Stack>
          <TextInput
            required
            label="PatientId"
            value={form.values.PatientId}
            onChange={(event) => form.setFieldValue('PatientId', event.currentTarget.value)}
            radius="md"
          />
          {isEdit && (<TextInput
            required
            disabled
            label="AppointmentID"
            value={form.values.AppointmentID}
            onChange={(event) => form.setFieldValue('AppointmentID', event.currentTarget.value)}
            radius="md"
          />)}
          {/* {!isEdit && (<TextInput
            required
            label="AppointmentID"
            value={form.values.AppointmentID}
            onChange={(event) => form.setFieldValue('AppointmentID', event.currentTarget.value)}
            radius="md"
          />)} */}
          <TextInput
            required
            label="Gender"
            value={form.values.Gender}
            onChange={(event) => form.setFieldValue('Gender', event.currentTarget.value)}
            radius="md"
          />
          <NumberInput
            required
            label="Age"
            value={form.values.Age}
            onChange={(val) => form.setFieldValue('Age', val as number)}
            radius="md"
          />
          <TextInput
            required
            label="Neighbourhood"
            value={form.values.Neighbourhood}
            onChange={(event) => form.setFieldValue('Neighbourhood', event.currentTarget.value)}
            radius="md"
          />
          <Checkbox
            label="Scholarship"
            checked={form.values.Scholarship}
            onChange={(event) => form.setFieldValue('Scholarship', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="Hipertension"
            checked={form.values.Hipertension}
            onChange={(event) => form.setFieldValue('Hipertension', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="Diabetes"
            checked={form.values.Diabetes}
            onChange={(event) => form.setFieldValue('Diabetes', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="Alcoholism"
            checked={form.values.Alcoholism}
            onChange={(event) => form.setFieldValue('Alcoholism', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="Handicap"
            checked={form.values.Handicap}
            onChange={(event) => form.setFieldValue('Handicap', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="SMSReceived"
            checked={form.values.SMSReceived}
            onChange={(event) => form.setFieldValue('SMSReceived', event.currentTarget.checked)}
            radius="md"
          />
          <Checkbox
            label="NoShow"
            checked={form.values.NoShow}
            onChange={(event) => form.setFieldValue('NoShow', event.currentTarget.checked)}
            radius="md"
          />
        </Stack>
        <Button type="submit" radius="xl" mt="md">
          {`${isEdit ? "Edit" : "Create"}`}
        </Button>
      </form>
    </Modal>
    <Button radius="xl" mt="md" mb="md" justify="center" onClick={() => {
      setIsEdit(false);
      // let foo = _.pick(row, ["PatientId", "AppointmentID", "Gender", "ScheduledDay", "AppointmentDay", "Age", "Neighbourhood", "Scholarship", "Hipertension", "Diabetes", "Alcoholism", "Handicap", "SMSReceived", "NoShow"]);

      form.reset();
      open()
    }}>Create</Button>
    <MantineReactTable table={table} />
  </>);
}

export default Page;
