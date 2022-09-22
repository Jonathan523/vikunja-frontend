import AttachmentModel from '@/models/attachment'
import type {IAttachment} from '@/modelTypes/IAttachment'

import AttachmentService from '@/services/attachment'
import { store } from '@/store'

export function uploadFile(taskId: number, file: File, onSuccess: (url: string) => void) {
	const attachmentService = new AttachmentService()
	const files = [file]

	return uploadFiles(attachmentService, taskId, files, onSuccess)
}

export async function uploadFiles(
	attachmentService: AttachmentService,
	taskId: number,
	files: File[] | FileList,
	onSuccess: Function = () => {},
) {
	const attachmentModel = new AttachmentModel({taskId})
	const response = await attachmentService.create(attachmentModel, files)
	console.debug(`Uploaded attachments for task ${taskId}, response was`, response)

	response.success?.map((attachment: IAttachment) => {
		store.dispatch('tasks/addTaskAttachment', {
			taskId,
			attachment,
		})
		onSuccess(generateAttachmentUrl(taskId, attachment.id))
	})

	if (response.errors !== null) {
		throw Error(response.errors)
	}
}

export function generateAttachmentUrl(taskId: number, attachmentId: number) {
	return `${window.API_URL}/tasks/${taskId}/attachments/${attachmentId}`
}