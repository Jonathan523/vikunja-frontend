import {formatISO} from 'date-fns'

import AbstractService from './abstractService'
import AttachmentModel from '../models/attachment'

import type { IAttachment } from '@/modelTypes/IAttachment'

import {downloadBlob} from '@/helpers/downloadBlob'

export default class AttachmentService extends AbstractService<AttachmentModel> {
	constructor() {
		super({
			create: '/tasks/{taskId}/attachments',
			getAll: '/tasks/{taskId}/attachments',
			delete: '/tasks/{taskId}/attachments/{id}',
		})
	}

	processModel(model: IAttachment) {
		return {
			...model,
			created: formatISO(new Date(model.created)),
		}
	}

	useCreateInterceptor() {
		return false
	}

	modelFactory(data: Partial<IAttachment>) {
		return new AttachmentModel(data)
	}

	modelCreateFactory(data) {
		// Success contains the uploaded attachments
		data.success = (data.success === null ? [] : data.success).map(a => {
			return this.modelFactory(a)
		})
		return data
	}

	getBlobUrl(model: IAttachment) {
		return AbstractService.prototype.getBlobUrl.call(this, '/tasks/' + model.taskId + '/attachments/' + model.id)
	}

	async download(model: IAttachment) {
		const url = await this.getBlobUrl(model)
		return downloadBlob(url, model.file.name)
	}

	/**
	 * Uploads a file to the server
	 * @param files
	 * @returns {Promise<any|never>}
	 */
	create(model: IAttachment, files: File[] | FileList) {
		const data = new FormData()
		for (let i = 0; i < files.length; i++) {
			// TODO: Validation of file size
			data.append('files', new Blob([files[i]]), files[i].name)
		}

		return this.uploadFormData(
			this.getReplacedRoute(this.paths.create, model),
			data,
		)
	}
}
