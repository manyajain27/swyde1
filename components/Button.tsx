import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  width?: number | string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  buttonStyle,
  textStyle,
  width = '100%',
}) => {
  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // Determine text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyles(),
        { width },
        disabled && styles.disabledButton,
        buttonStyle,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#5956E9' : '#ffffff'} 
          size={ms(24)} 
        />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: vs(52),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: 'black',
  },
  secondaryButton: {
    backgroundColor: '#F4F3FE',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: s(1),
    borderColor: '#5956E9',
  },
  primaryText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#5956E9',
  },
  outlineText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#5956E9',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;