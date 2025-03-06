import React, { ForwardRefRenderFunction, RefObject, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle, 
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';

// Define the prop types for the Input component
interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  inputRef?: RefObject<TextInput>;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = (props) => {
  const {
    containerStyle,
    label,
    icon,
    rightIcon,
    error,
    inputRef,
    onRightIconPress,
    ...restProps
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#FF3B30' : '#E1E1E1', '#5956E9'],
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View 
        style={[
          styles.container, 
          { borderColor },
          error && styles.errorContainer
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={'#9E9E9E'}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: vs(16),
  },
  label: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#424242',
    marginBottom: vs(6),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: vs(56),
    borderWidth: s(1.5),
    borderColor: '#E1E1E1',
    borderRadius: ms(12),
    backgroundColor: '#F8F8F8',
    paddingHorizontal: s(16),
  },
  errorContainer: {
    borderColor: '#FF3B30',
  },
  iconContainer: {
    marginRight: s(12),
  },
  rightIconContainer: {
    marginLeft: s(12),
  },
  input: {
    flex: 1,
    fontSize: ms(15),
    color: '#212121',
    height: '100%',
    paddingVertical: 0,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: ms(12),
    marginTop: vs(4),
    marginLeft: s(4),
  }
});