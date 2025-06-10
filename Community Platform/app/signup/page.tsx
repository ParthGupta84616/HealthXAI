"use client";
import React from 'react'
import {
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    TextField,
    Typography,
  } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import CircularProgress from '@mui/material/CircularProgress';
import { useState , useEffect} from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/navigation';
  
  const Register = () => {
    const Router = useRouter();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
    })
    useEffect(() => {
      if(user.username.length > 0 && user.email.length > 0 && user.password.length > 0) {
        
        setButtonDisabled(false);

    }else{
        setButtonDisabled(true);
    }
    
      
    }, [user])
    
  
    const handleRegister = async () => {
        if(!buttonDisabled){
            setLoading(true);
            try {

                const response =await axios.post('/api/users/signup', user);
                console.log("Signup success", response.data);
                Router.push("/login");
    
            } catch (error: any) {
                setLoading(false);
                setButtonDisabled(false);
                console.log(error.message)
                
            }
        }
    };
  
    return (
      <>
        <Container maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              mt: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
              <LockOutlined />
            </Avatar>
            <Typography variant="h5">Signup</Typography>
            <Box sx={{ mt: 3 }}>
            <form onSubmit={(event) => {
              event.preventDefault(); // Prevent the default form submit action
              handleRegister(); // Call the handleRegister function
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="Username"
                    required
                    fullWidth
                    id="Username"
                    label="Username"
                    autoFocus
                    value={user.username}
                    onChange={(e) => setUser({...user, username: e.target.value})}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                type='submit'
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleRegister}
                disabled={loading} 
                startIcon={loading ? <CircularProgress size={24} /> : null} 
                >
                {loading ? 'Signing up...' : 'Signup'} 
                </Button>
                </form>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login">Already have an account? Login</Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </>
    );
  };
  
  export default Register;