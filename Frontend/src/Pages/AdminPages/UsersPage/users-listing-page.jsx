import { useCallback, useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import UsersTable from './usersTable.jsx';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

export default function UsersListingPage() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const getQueryParams = useCallback(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    return { page, search, limit };
  }, [searchParams]);

  const fetchUsers = useCallback(async () => {
    const { page, search, limit } = getQueryParams();
    const filters = {
      page,
      limit,
      ...(search && { search }),
    };

    try {
      const { data } = await axios.get(`${SERVER_URL}/api/user/q`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });

      setTotalUsers(data.totalUsers);
      setTotalPages(data.totalPages);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [getQueryParams]);

  useEffect(() => {
    fetchUsers();
  }, [searchParams, fetchUsers]);


  return (
    <div className="space-y-4 m-5">
      <div className="flex items-start justify-between">
        <Heading
          title={`Users (${totalUsers})`}
          description="Manage Users"
        />
      </div>
      <Separator />
      <UsersTable data={users} totalData={totalPages} />
    </div>
  );
}
