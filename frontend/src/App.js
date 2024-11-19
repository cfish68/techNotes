import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Public from './components/Public';
import DashLayout from './components/DashLayout';
// import DashFooter from './components/Dashfooter';
import Login from './features/auth/Login';
import Welcome from './features/auth/Welcome'
import NotesList from './features/Notes/NotesList'
import UsersList from './features/users/UsersList'

import EditUser from './features/users/EditUser';
import NewUserForm from './features/users/NewUserForm';
import EditNote from './features/Notes/EditNote';
import NewNote from './features/Notes/NewNote';
import Prefetch from './features/auth/Prefetch';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
        

        <Route element={<Prefetch />} >
        <Route path='dash' element={<DashLayout />}>

        <Route index element={<Welcome />} />

        
        <Route path='users'>
          <Route index element={<UsersList />} />
            <Route path=':id' element={<EditUser />} />
            <Route path='new' element={<NewUserForm />} />

        </Route>
        <Route path='notes'>
          <Route index element={<NotesList />} />
          <Route path=':id' element={<EditNote />} />
          <Route path='new' element={<NewNote />} />
        </Route>
        </Route>
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
