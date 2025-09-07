export interface StatusColorType {
  light: string
  dark: string
  marker: string
  text: string
}

// {key: "N", val: "Новый"}
// {key: "A", val: "Подтвержден"}
// {key: "S", val: "На доработке"}
// {key: "F", val: "Закрыт"}
// {key: "D", val: "Отменен"}

export const getStatusColor = (statusKey: string): StatusColorType => {
  switch (statusKey) {
    case 'N':
      return {
        light: '#C8E6C9',
        dark: '#C8E6C9',
        marker: '#4CAF50',
        text: '#1B5E20'
      }
    case 'A':
      return {
        light: '#B3E5FC',
        dark: '#B3E5FC',
        marker: '#2196F3',
        text: '#0D47A1'
      }

    case 'S':
      return {
        light: '#FFECB3',
        dark: '#FFECB3',
        marker: '#FFC107',
        text: '#E65100'
      }

    case 'F':
      return {
        light: '#EEEEEE',
        dark: '#EEEEEE',
        marker: '#9E9E9E',
        text: '#212121'
      }

    case 'D':
      return {
        light: '#FFCDD2',
        dark: '#FFCDD2',
        marker: '#F44336',
        text: '#B71C1C'
      }

    default:
      return {
        light: '#EEEEEE',
        dark: '#EEEEEE',
        marker: '#9E9E9E',
        text: '#212121'
      }
  }
}
