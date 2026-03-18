import { useAppRequest } from '~/shared/libs/api/use-app-requests'

interface EmailQueueItem {
  msgGuid: string;
  files: string[];
  title: string;
  toEmail: string;
}
interface EmailQueueData {
  queye: EmailQueueItem[];
  errors: EmailQueueItem[];
}


export const useEmailQueueApi = () => {
  const { checkError, fetchWithToken } = useAppRequest()

  async function getEmailQueue(): Promise<EmailQueueData>  {
    const res = await fetchWithToken('admin/system/GetEmailQueye')
    const data = checkError(res).data as EmailQueueData
    return data
  }

  async function removeEmailFromStack(id: string) {
    const query = new URLSearchParams({
      id
    })
    const res = await fetchWithToken(`admin/system/RemoveEmailFromStack?guid=${query.toString()}`)
    const data = checkError(res).data
    return data
  }

  async function repeatSendErrors() {
    const res = await fetchWithToken('admin/system/RepeatSendErrors')
    const data = checkError(res).data
    return data
  }

  async function clearErrorMessagesStack() {
    const res = await fetchWithToken('admin/system/ClearErrorMessagesStack')

    const data = checkError(res).data
    return data
  }

  return {
    getEmailQueue,
    removeEmailFromStack,
    repeatSendErrors,
    clearErrorMessagesStack
  }
}
