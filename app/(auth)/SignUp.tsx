import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { s, vs, ms } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import Input from '@/components/InputText';
import Button from '@/components/Button';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; name?: string}>({});

  const validateInputs = () => {
    const newErrors: {email?: string; password?: string; name?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if(!name){
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    let trimmedName = name.trim();
    let trimmedEmail = email.trim();
    let trimmedPassword = password.trim();
    
    setLoading(true);

    const {data: {session}, error} = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          name: trimmedName
        }
      }
    });

    setLoading(false);

    if(error){
      Alert.alert('Sign Up', error.message);
    }
    
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* Welcome Text */}
          <View style={[styles.welcomeContainer, Platform.OS === 'android' && styles.welcomeContainerAndroid]}>
            <Text style={[styles.welcomeText, Platform.OS === 'android' && styles.welcomeTextAndroid]}>Lets</Text>
            <Text style={[ styles.welcomeText, styles.brandText, Platform.OS === 'android' && styles.welcomeTextAndroid]}>
              Get Started!
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, Platform.OS === 'android' && styles.formContainerAndroid]}>
            <Text style={[styles.formTitle, Platform.OS === 'android' && styles.formTitleAndroid]}>
              Please Login to continue
            </Text>
            
            <Input
              label="Name"
              icon={<Ionicons name="person-outline" size={Platform.OS === 'android' ? ms(18) : ms(22)} color="black" />}
              placeholder="Enter your name"
              keyboardType="default"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <Input
              label="Email"
              icon={<Ionicons name="mail-outline" size={Platform.OS === 'android' ? ms(18) : ms(22)} color="black" />}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            
            <Input
              label="Password"
              icon={<Ionicons name="lock-closed-outline" size={Platform.OS === 'android' ? ms(18) : ms(22)} color="black" />}
              rightIcon={
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={Platform.OS === 'android' ? ms(18) : ms(22)} 
                  color="#9E9E9E" 
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            
            <Button 
              title="Sign Up" 
              onPress={onSubmit} 
              loading={loading}
              buttonStyle={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={[styles.footerContainer, Platform.OS === 'android' && styles.footerContainerAndroid]}>
            <Text style={styles.noAccountText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/SignIn')}>
              <Text style={styles.signUpText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingTop: Platform.OS === 'android' ? vs(24) : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: s(24),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? vs(10) : vs(20),
  },
  logoBox: {
    width: Platform.OS === 'android' ? ms(60) : ms(70),
    height: Platform.OS === 'android' ? ms(60) : ms(70),
    borderRadius: Platform.OS === 'android' ? ms(15) : ms(20),
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: Platform.OS === 'android' ? ms(20) : ms(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeContainer: {
    marginTop: vs(30),
  },
  welcomeContainerAndroid: {
    marginTop: vs(15),
  },
  welcomeText: {
    fontSize: ms(28),
    fontWeight: 'bold',
    color: '#212121',
    lineHeight: ms(36),
  },
  welcomeTextAndroid: {
    fontSize: ms(24),
    lineHeight: ms(30),
  },
  brandText: {
    color: 'black',
  },
  formContainer: {
    marginTop: vs(40),
  },
  formContainerAndroid: {
    marginTop: vs(20),
  },
  formTitle: {
    fontSize: ms(16),
    color: '#757575',
    marginBottom: vs(20),
  },
  formTitleAndroid: {
    fontSize: ms(14),
    marginBottom: vs(12),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Platform.OS === 'android' ? vs(16) : vs(24),
  },
  forgotPasswordText: {
    color: 'black',
    fontSize: Platform.OS === 'android' ? ms(12) : ms(14),
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: Platform.OS === 'android' ? vs(12) : vs(20),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(40),
    marginBottom: vs(20),
  },
  footerContainerAndroid: {
    marginTop: vs(20),
    marginBottom: vs(16),
  },
  noAccountText: {
    fontSize: Platform.OS === 'android' ? ms(12) : ms(14),
    color: '#757575',
    marginRight: s(4),
  },
  signUpText: {
    fontSize: Platform.OS === 'android' ? ms(12) : ms(14),
    fontWeight: 'bold',
    color: 'black',
  },
});

